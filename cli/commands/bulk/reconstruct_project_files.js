let fs = require('fs-extra');
let pathLibrary = require('path');
let Paragraph = require('../shared/paragraph');
let Topic = require('../shared/topic');
let chalk = require('chalk');
let {
  getAllFileAndDirectoryPathsRecursive,
  allFilesAndDirectoriesOf,
  messageComparator
} = require('./helpers');

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

function reconstructProjectFiles(dataFile, originallySelectedFiles, options) {
  let { filesToWrite, directoriesToEnsure, filesEdited } = parseDataFile(dataFile);
  let { originalSelectedFilesContents, allFileAndDirectoryPaths } = readFilesFromDisk(filesToWrite, originallySelectedFiles);
  let { messages, directoriesToCreate, filesToWriteFinal, pathsToDelete, directoriesToDelete } =
    compareChangesWithFileSystem({ filesToWrite, directoriesToEnsure, originallySelectedFiles, originalSelectedFilesContents, allFileAndDirectoryPaths });
  if (!options.noBackup) saveBackup(filesToWriteFinal, originalSelectedFilesContents);
  updateFileSystem({ filesToWriteFinal, directoriesToEnsure, pathsToDelete, messages, directoriesToDelete });
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

function readFilesFromDisk(filesToWrite, originallySelectedFiles) {
  let originalSelectedFilesContents = {};

  // Get originals of files we may overwrite
  Object.keys(filesToWrite).forEach(filePath => {
    if (fs.existsSync(filePath)) {
      originalSelectedFilesContents[filePath] = fs.readFileSync(filePath).toString();
    }
  });

  // Get originals of files we initiated the session with
  originallySelectedFiles.forEach(filePath => {
    originalSelectedFilesContents[filePath] = fs.readFileSync(filePath).toString();
  });

  let allFileAndDirectoryPaths = getAllFileAndDirectoryPathsRecursive('topics');

  return { originalSelectedFilesContents, allFileAndDirectoryPaths };
}

function compareChangesWithFileSystem({ filesToWrite, directoriesToEnsure, originallySelectedFiles, originalSelectedFilesContents, allFileAndDirectoryPaths }) {
  let messages = [];
  let pathsToDelete = [];
  let filesToWriteFinal = {};

  directoriesToEnsure.forEach(fullDirectoryPath => {
    let directoryPathSegments = fullDirectoryPath.split('/');
    for (let i = 1; i < directoryPathSegments.length; i++) { // skip the path 'topics'
      let directoryPath = directoryPathSegments.slice(0, i + 1).join('/'); // i + 1 so that we include the ith element
      if (!allFileAndDirectoryPaths.includes(directoryPath)) {
        messages.push(chalk.green(`Created directory: ${directoryPath}`));
      }
    }
  });

  Object.keys(filesToWrite).forEach(filePath => {
    let alreadyOnDisk = originalSelectedFilesContents.hasOwnProperty(filePath);
    let wasLoadedInSession = originallySelectedFiles.includes(filePath);

    if (alreadyOnDisk && !wasLoadedInSession) { // appended to existing file
      filesToWriteFinal[filePath] = originalSelectedFilesContents[filePath] + "\n\n" + filesToWrite[filePath];
      messages.push(chalk.yellow(`Appended to file: ${filePath}`));
    } else if (filesToWrite[filePath] !== originalSelectedFilesContents[filePath]) { // write
      filesToWriteFinal[filePath] = filesToWrite[filePath];
      if (allFileAndDirectoryPaths.includes(filePath)) {
        messages.push(chalk.green(`Overwrote file: ${filePath}`)); // either created or overwrote entirely
      } else {
        messages.push(chalk.green(`Created file: ${filePath}`)); // either created or overwrote entirely
      }
    }
  });

  originallySelectedFiles.forEach(originalFilePath => {
    if (!filesToWrite.hasOwnProperty(originalFilePath)) {
      messages.push(chalk.red(`Deleted file: ${originalFilePath}`));
      pathsToDelete.push(originalFilePath);
    }
  });

  let directoriesToDelete = getDirectoriesToDelete({
    pathsToDelete,
    pathsToDelete,
    filesToWriteFinal,
    originalSelectedFilesContents,
    messages,
    allFileAndDirectoryPaths
  });

  messages.sort(messageComparator);

  return { messages, filesToWriteFinal, directoriesToEnsure, pathsToDelete, directoriesToDelete };
}

function getDirectoriesToDelete({ pathsToDelete, filesToWriteFinal, originalSelectedFilesContents, messages, allFileAndDirectoryPaths }) {
  let directoriesToDelete = [];
  pathsToDelete.forEach(filePath => {
    let directoryPathSegments = filePath.split('/').slice(0, -1);
    for (let i = directoryPathSegments.length; i > 1; i--) { // skip the path 'topics'
      let directoryPath = directoryPathSegments.slice(0, i).join('/');

      let directoryExisted = allFileAndDirectoryPaths.includes(directoryPath);
      let directoryNowEmpty = allFileAndDirectoryPaths // take the original file system entities
        .concat(allFilesAndDirectoriesOf(Object.keys(filesToWriteFinal))) // add the new entities from this session
        .filter(path => !pathsToDelete.includes(path)) // remove files we're deleting
        .filter(path => !directoriesToDelete.includes(path)) // remove directories we're deleting
        .filter(path => path.startsWith(directoryPath)) // select paths for entities in the given directory
        .length === 1; // the only path should be the directory itself, meaning it is empty

      if (directoryExisted && directoryNowEmpty) {
        directoriesToDelete.push(directoryPath);
        messages.push(chalk.red(`Deleted directory: ${directoryPath}`));
      }
    }
  });
  return directoriesToDelete;
}

function saveBackup(filesToWriteFinal, originalSelectedFilesContents) {
  let priorLog = fs.existsSync('.canopy_bulk_backup_log') && fs.readFileSync('.canopy_bulk_backup_log');

  fs.writeFileSync(
    '.canopy_bulk_backup_log',
    (priorLog && (priorLog + "\n\n\n")) +
    "Old files: \n\n" +
    Object.keys(originalSelectedFilesContents).map(p => `* ${p}\n\n${originalSelectedFilesContents[p]}\n\n`).join('') +
    "\n\n\nNew and changed files: " +
    Object.keys(filesToWriteFinal).map(p => `${p}\n\n${filesToWriteFinal[p]}\n\n`).join('') +
    "\n"
  );
}

function updateFileSystem({ filesToWriteFinal, directoriesToEnsure, pathsToDelete, messages, directoriesToDelete }) {
  directoriesToEnsure.forEach(directoryPath => fs.ensureDirSync(directoryPath));

  Object.keys(filesToWriteFinal).forEach(filePath => {
    fs.writeFileSync(filePath, filesToWriteFinal[filePath]);
  });

  pathsToDelete.forEach(path => {
    fs.unlinkSync(path);
  });

  directoriesToDelete.forEach(path => {
    fs.rmdir(path);
  })
}

module.exports = {
  reconstructProjectFiles,
  parseDataFile,
  compareChangesWithFileSystem
};
