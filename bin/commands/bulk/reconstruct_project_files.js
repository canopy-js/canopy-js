let fs = require('fs-extra');
let { keyFromString } = require('./helpers');
let { TopicName, Paragraph } = require('../shared');

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

function reconstructProjectFiles(dataFile, originalFileList) {
  let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);
  let fileSystemData = collectFileSystemData(filesToWrite, originalFileList);
  let { messages, filesToWriteFinal, pathsToDelete } = compareChangesWithFileSystem(filesToWrite, directoriesToEnsure, originalFileList, fileSystemData);
  saveBackup(filesToWriteFinal, fileSystemData);
  updateFileSystem(filesToWriteFinal, directoriesToEnsure, pathsToDelete);
  messages.forEach(message => console.log(message));
}

function parseDataFile(dataFile) {
  let filesToWrite = {};
  let directoriesToEnsure = [];
  let sections = dataFile.split(/(?=^\[.*\]\n)/gm); // Take the path-initial sections

  sections.filter(Boolean).forEach(section => {
    let path = section.split("\n")[0].match(/\[([^/].*[^/])\]/)?.[1];
    if (!path) throw `Invalid path: ${section.split("\n")[0]}`;
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
        let topicName = new TopicName(key);
        let fullPath = `${directoryPath}/${topicName.fileName}.expl`;

        if (filesToWrite.hasOwnProperty(fullPath)) { // the same file was open in this session already
          filesToWrite[fullPath] += "\n\n" + fileText + "\n";
        } else {
          filesToWrite[fullPath] = fileText + "\n";
        }
      } else { // there was no key
        categoryNotes.push(fileText);
      }
    });


    let categoryName = new TopicName(pathSegments.slice(-1)[0]);
    let categoryNotePath = `${directoryPath}/${categoryName.fileName}.expl`;

    if (categoryNotes.length > 0) {
      if (filesToWrite[categoryNotePath]) { // If there is a real file already existing at A/B/C/C.expl, add to it
        filesToWrite[categoryNotePath] = filesToWrite[categoryNotePath] + "\n\n" + categoryNotes.join("\n\n");
      } else {
        filesToWrite[categoryNotePath] = categoryNotes.join("\n\n"); // Otherwise start a new one
      }
    }
  });

  return { filesToWrite, directoriesToEnsure };
}

function collectFileSystemData(filesToWrite, originalFileList) {
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

    if (alreadyOnDisk && !wasLoadedInSession) { // append
      filesToWriteFinal[filePath] = fileSystemData[filePath] + "\n\n" + filesToWrite[filePath];
      messages.push(`Appended to file: ${filePath}`);
    } else if (filesToWrite[filePath] !== fileSystemData[filePath]) { // write
      filesToWriteFinal[filePath] = filesToWrite[filePath];
      messages.push(`Wrote to file: ${filePath}`);
    }
  });

  originalFileList.forEach(originalFilePath => {
    if (!filesToWrite.hasOwnProperty(originalFilePath)) {
      messages.push(`Deleted file: ${originalFilePath}`);
      pathsToDelete.push(originalFilePath);
    }
  });

  return { messages, filesToWriteFinal, directoriesToEnsure, pathsToDelete };
}

function saveBackup(dataFile, fileSystemData) {
  let priorLog = fs.existsSync('.canopy_bulk_backup_log') && fs.readFileSync('.canopy_bulk_backup_log');
  fs.writeFileSync(
    '.canopy_bulk_backup_log',
    (priorLog && (priorLog + "\n\n")) +
    'Old files: ' +
    JSON.stringify(fileSystemData) +
    "\n\nNew files: " +
    JSON.stringify(dataFile) +
    "\n\n"
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
}
