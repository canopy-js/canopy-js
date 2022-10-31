let fs = require('fs-extra');
let Paragraph = require('../shared/paragraph');
let Topic = require('../shared/topic');
let chalk = require('chalk');

/*

  A canopy bulk file might look like this:

  -- File begins --
  [A/B/C]

  * Topic1: ABC.

  Subtopic1: DEF.

  * Topic2: ABC.

  Subtopic2: DEF.


  [A/C]

  Notes without asterisk.

  * Topic3: ABC.

  * File without key.

  [A/D]

  Key: Note without asterisk

  -- File ends --

  This file should produce the following files and folders:

  - topics/A/B/C/Topic1.expl:
    Topic1: ABC.

    Subtopic1: DEF.

  - topics/A/B/C/Topic2.expl:
    Topic2: ABC.

    Subtopic2: DEF.

  - topics/A/C/Topic3.expl:
    Topic3: ABC.

  - topics/A/C/C.expl:
    Notes without asterisk.

    File without key.

  - topics/A/D/Key.expl:
    Key: Notes without asterisk

*/

function reconstructProjectFiles(dataFile, originalFileList, options) {
  let { filesToWrite, directoriesToEnsure, filesEdited } = parseDataFile(dataFile);
  let fileSystemData = readFilesFromDisk(filesToWrite, originalFileList);
  let { messages, filesToWriteFinal, pathsToDelete } = compareChangesWithFileSystem(filesToWrite, directoriesToEnsure, originalFileList, fileSystemData);
  if (!options.noBackup) saveBackup(filesToWriteFinal, fileSystemData);
  updateFileSystem(filesToWriteFinal, directoriesToEnsure, pathsToDelete);
  fs.writeFileSync('.canopy_bulk_last_session_files', JSON.stringify(filesEdited));
  messages.forEach(message => console.log(message));
}

function parseDataFile(dataFile) {
  let filesToWrite = {};
  let directoriesToEnsure = [];
  let filesEdited = [];
  let sections = dataFile.split(/(?=^\[.*\]\n)/gm).map(s => s.trim()).filter(Boolean); // Take the path-initial sections

  sections.forEach(section => {
    let path = section.split("\n")[0].match(/\[([^/].*[^/])\]/)?.[1];
    if (!path) throw new Error(`Invalid directory path: "${section.split("\n")[0]}"`);
    let pathWithUnderscores = path.replace(/ /g,'_');
    let pathSegments = path.split('/');
    let directoryPath = `topics/${pathWithUnderscores}`;
    directoriesToEnsure.push(directoryPath);

    let fileTexts = section
      .split("\n")
      .slice(1) // remove the path
      .join("\n")
      .split(/^\* /gm)
      .map(text => text.trim())
      .filter(Boolean);

    let categoryNotes = [];

    fileTexts.forEach(fileText => {
      let paragraph = new Paragraph(fileText);
      let key = paragraph.key || '';

      if (key) {
        let topic = new Topic(key);
        let fullPath = `${directoryPath}/${topic.fileName}.expl`;

        if (filesToWrite.hasOwnProperty(fullPath)) { // the same file was open in this session already
          filesToWrite[fullPath] += "\n\n" + fileText + "\n";
        } else {
          filesToWrite[fullPath] = fileText + "\n";
        }
        filesEdited.push(fullPath);
      } else { // there was no key
        categoryNotes.push(fileText);
      }
    });


    let categoryName = new Topic(pathSegments.slice(-1)[0]);
    let categoryNotePath = `${directoryPath}/${categoryName.fileName}.expl`;

    if (categoryNotes.length > 0) {
      if (filesToWrite[categoryNotePath]) { // If there is a real file already existing at A/B/C/C.expl, add to it
        filesToWrite[categoryNotePath] = filesToWrite[categoryNotePath].trim() + "\n\n" + categoryNotes.join("\n\n") + '\n';
      } else {
        filesToWrite[categoryNotePath] = categoryNotes.join("\n\n") + '\n'; // Otherwise start a new one
      }
      filesEdited.push(categoryNotePath);
    }
  });

  return { filesToWrite, directoriesToEnsure, filesEdited };
}

function readFilesFromDisk(filesToWrite, originalFileList) {
  let fileSystemData = {};

  Object.keys(filesToWrite).forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fileSystemData[filePath] = fs.readFileSync(filePath).toString();
    }
  });

  originalFileList.forEach(filePath => {
    fileSystemData[filePath] = fs.readFileSync(filePath).toString();
  });

  return fileSystemData;
}

function compareChangesWithFileSystem(filesToWrite, directoriesToEnsure, originalFileList, fileSystemData) {
  let messages = [];
  let pathsToDelete = [];
  let filesToWriteFinal = {};

  Object.keys(filesToWrite).forEach(filePath => {
    let alreadyOnDisk = fileSystemData.hasOwnProperty(filePath);
    let wasLoadedInSession = originalFileList.includes(filePath);

    if (alreadyOnDisk && !wasLoadedInSession) { // appended to existing file
      filesToWriteFinal[filePath] = fileSystemData[filePath] + "\n\n" + filesToWrite[filePath];
      messages.push(chalk.yellow(`Appended to file: ${filePath}`));
    } else if (filesToWrite[filePath] !== fileSystemData[filePath]) { // write
      filesToWriteFinal[filePath] = filesToWrite[filePath];
      messages.push(chalk.green(`Wrote to file: ${filePath}`)); // either created or overwrote entirely
    }
  });

  originalFileList.forEach(originalFilePath => {
    if (!filesToWrite.hasOwnProperty(originalFilePath)) {
      messages.push(chalk.red(`Deleted file: ${originalFilePath}`));
      pathsToDelete.push(originalFilePath);
    }
  });

  return { messages, filesToWriteFinal, directoriesToEnsure, pathsToDelete };
}

function saveBackup(filesToWriteFinal, fileSystemData) {
  let priorLog = fs.existsSync('.canopy_bulk_backup_log') && fs.readFileSync('.canopy_bulk_backup_log');

  fs.writeFileSync(
    '.canopy_bulk_backup_log',
    (priorLog && (priorLog + "\n\n\n")) +
    "Old files: \n\n" +
    Object.keys(fileSystemData).map(p => `* ${p}\n\n${fileSystemData[p]}\n\n`).join('') +
    "\n\n\nNew and changed files: " +
    Object.keys(filesToWriteFinal).map(p => `${p}\n\n${filesToWriteFinal[p]}\n\n`).join('') +
    "\n"
  );
}

function updateFileSystem(filesToWrite, directoriesToEnsure, pathsToDelete) {
  directoriesToEnsure.forEach(directoryPath => fs.ensureDirSync(directoryPath));

  Object.keys(filesToWrite).forEach(filePath => {
    fs.writeFileSync(filePath, filesToWrite[filePath]);
  });

  pathsToDelete.forEach(path => {
    fs.unlinkSync(path);
    deleteEmptyFolders(path);
  });
}

function deleteEmptyFolders(path) {
  let pathSegments = path.split('/').slice(0, -1);
  for (let i = pathSegments.length; i > 0; i--) {
    let currentPath = pathSegments.slice(0, i).join('/');
    if (fs.existsSync(currentPath) && fs.readdirSync(currentPath).length === 0) {
      fs.rmdir(currentPath);
      console.log(`Deleted directory: ${currentPath}`);
    }
  }
}

module.exports = {
  reconstructProjectFiles,
  parseDataFile,
  compareChangesWithFileSystem
};
