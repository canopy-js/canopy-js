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

*/

function reconstructProjectFiles(dataFile, originalFileList) {
  let pathHandled = {};
  let sections = dataFile.split(/(?=^\[.*\]\n)/gm); // Take the path-initial sections

  sections.filter(Boolean).forEach(section => {
    let blocks = section.split("\n\n");
    let path = blocks[0].match(/\[(.*)\]/)[1]; //
    let pathSegments = path.split('/');
    let fileTexts = blocks.slice(1).join("\n\n").split(/(?=^\* )/gm); // Take the
    let categoryNotes = [];

    if (!fileTexts[0].startsWith("* ")) { // Notes without asterisk before first asterisk
      categoryNotes.push(fileTexts[0]) // Keep a list of uncategorized notes to put in A/B/C/C.expl eg.
      fileTexts = fileTexts.slice(1);
    }

    fileTexts = fileTexts.map(text => text.slice(2)) // remove "* " before file contents
    let directoriesToEnsure = [];
    let filesToWrite = {};

    fileTexts.forEach(fileContents => {
      let paragraph = new Paragraph(fileContents);
      let key = paragraph.key || '';
      let directoryPath, fullPath;

      if (key) {
        let topicName = new TopicName(key);
        directoryPath = `topics/${path.replace(/ /g,'_')}`;
        fullPath = `${directoryPath}/${topicName.fileName}.expl`;
        directoriesToEnsure.push(directoryPath);
        if (filesToWrite.hasOwnProperty(fullPath)) {
          throw `Bulk file writes two file in two places: ${fullPath}`;
        }
        filesToWrite[fullPath] = fileContents.trim();
      } else {
        if (fileContents.trim()) {
          categoryNotes.push(fileContents.trim());
        }
      }
    });

    let categoryName = pathSegments.slice(-1)[0];
    let categoryNotePath = `topics/${path}/${categoryName}.expl`;
    if (categoryNotes.length > 0) {
      if (filesToWrite[categoryNotePath]) { // If there is a real file already existing at A/B/C/C.expl, add to it
        filesToWrite[categoryNotePath] = filesToWrite[categoryNotePath] + "\n\n" + categoryNotes.join("\n\n");
      } else {
        filesToWrite[categoryNotePath] = categoryNotes.join("\n\n"); // Otherwise start a new one
      }
    }

    directoriesToEnsure.forEach(directoryPath => fs.ensureDirSync(directoryPath));
    Object.keys(filesToWrite).forEach(filePath => {
      writeFile(filePath, filesToWrite[filePath]);
    });
  });

  originalFileList.forEach(originalFilePath => {
    if (!pathHandled.hasOwnProperty(originalFilePath.toUpperCase())) {
      writeLog(originalFilePath, 'File deleted.', 'Delete');
      fs.unlinkSync(originalFilePath);
      console.log(`Deleted file: ${originalFilePath}`);
      deleteEmptyFolders(originalFilePath);
    }
  });

  function writeFile(fullPath, newFileContents) {
    pathHandled[fullPath.toUpperCase()] = true;

    let oldFileContents = fs.existsSync(fullPath) && fs.readFileSync(fullPath).toString().trim();

    if (oldFileContents !== newFileContents) {
      if (originalFileList.includes(fullPath) || !oldFileContents) { // if file was loaded or is new, overwrite
        writeLog(fullPath, newFileContents, 'Write');
        fs.writeFileSync(fullPath, newFileContents + "\n");
        console.log(`Wrote to file: ${fullPath}`);
      } else {
        writeLog(fullPath, newFileContents, 'Append');
        fs.writeFileSync(fullPath, oldFileContents.trim() + "\n\n" + newFileContents + "\n");
        console.log(`Appended to file: ${fullPath}`);
      }
    }

  }
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

function writeLog(fullPath, newFileContents, message) {
  let priorLog = fs.existsSync('.canopy_bulk_backup_log') && fs.readFileSync('.canopy_bulk_backup_log');
  fs.writeFileSync(
    '.canopy_bulk_backup_log',
    (priorLog && priorLog + "\n\n") +
    (fs.existsSync(fullPath) && `Old: ${fullPath}: ${fs.readFileSync(fullPath)}` + "\n\n" || '') +
    `${message}: ${fullPath}: ${newFileContents.trim()}` + "\n\n"
  );
}

module.exports = reconstructProjectFiles;
