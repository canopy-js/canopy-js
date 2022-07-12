let fs = require('fs-extra');
let { keyFromString } = require('./helpers');
let { TopicName, Paragraph } = require('../shared');

function reconstructProjectFiles(dataFile, originalFileList) {
  let pathHandled = {};
  let sections = dataFile.split(/(?=^\[.*\]\n)/gm);

  sections.filter(Boolean).forEach(section => {
    let path = section.split("\n")[0].match(/\[(.*)\]/)[1];
    let pathSegments = path.split('/');
    let fileTexts = section.split(/(?=^\* )/gm).slice(1).map(file => file.slice(2));
    let categoryNotes = [];
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
          console.error(`Bulk file writes two file in two places: ${fullPath}`)
          process.exit();
        }
        filesToWrite[fullPath] = fileContents.trim();
      } else {
        if (fileContents.trim()) {
          categoryNotes.push(fileContents.trim());
        }
      }
    });

    let categoryNotePath = `topics/${path}/${pathSegments.slice(-1)[0]}.expl`;
    if (categoryNotes.length > 0) {
      if (filesToWrite[categoryNotePath]) {
        filesToWrite[categoryNotePath] = filesToWrite[categoryNotePath] + "\n\n" + categoryNotes.join("\n\n");
      } else {
        filesToWrite[categoryNotePath] = categoryNotes.join("\n\n");
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
