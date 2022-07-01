let fs = require('fs-extra');
let { keyFromString } = require('./helpers');

function reconstructProjectFiles(dataFile, originalFileList) {
  let pathHandled = {};

  let sections = dataFile.split(/(?=^[^:\n]+:\n)/gm);
  sections.filter(Boolean).forEach(section => {
    let path = section.split("\n")[0];
    let fileContents = section.split("\n").slice(1).join('').trim();
    let pathSegments = path.split(':')[0].split('/');
    let key = keyFromString(fileContents) || '';
    let newFileContents = section.split(/\n\n/).slice(1).join("\n\n").trim() + "\n";
    let keySlug = key.replace(/ /g,'_');
    let directoryPath = `Topics/${pathSegments.join('/').replace(/ /g,'_')}`;
    let fullPath = `${directoryPath}/${keySlug}.expl`;

    fs.ensureDirSync(directoryPath);

    if (fs.existsSync(fullPath) && fs.readFileSync(fullPath).toString().trim() + "\n" === newFileContents) {
      // console.log(`No changes to: ${fullPath}`);
    } else {
      writeLog(fullPath, newFileContents, 'Write');
      fs.writeFileSync(fullPath, newFileContents);
      console.log(`Wrote to file: ${fullPath}`);
    }
    pathHandled[fullPath.toLowerCase()] = true;
  });

  originalFileList.forEach(originalFilePath => {
    if (!pathHandled.hasOwnProperty(originalFilePath.toLowerCase())) {
      writeLog(originalFilePath, 'File deleted.', 'Delete');
      fs.unlinkSync(originalFilePath);
      console.log(`Deleted file: ${originalFilePath}`);
      deleteEmptyFolders(originalFilePath);
    }
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
