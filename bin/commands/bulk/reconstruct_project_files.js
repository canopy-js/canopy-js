let fs = require('fs-extra');
let { keyFromFile } = require('./helpers');

function reconstructProjectFiles(dataFile, originalFileList) {
  let pathHandled = {};

  let sections = dataFile.split(/(?=^[^:\n]+:\n)/gm);

  sections.filter(Boolean).forEach(section => {
    let pathSegments = section.split("\n")[0].split(':')[0].split('/');
    let key = pathSegments.slice(-1)[0];
    let newFileContents = `${key}: ${section.split(/\n\n/).slice(1).join("\n\n").trim() + "\n"}`;
    let keySlug = key.replace(/ /g,'_');
    let initialPath = pathSegments.slice(0, -1).join('/').replace(/ /g,'_');
    let trailingSlash = initialPath ? '/' : '';
    let directoryPath = 'topics' + '/' + initialPath + trailingSlash + keySlug;
    let fullPath = 'topics' + '/' + initialPath + trailingSlash + keySlug + '/' + keySlug + '.expl';

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
      writeLog(fullPath, newFileContents, 'Delete');
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
  let priorLog = fs.readFileSync('.canopy_bulk_backup_log');
  fs.writeFileSync(
    '.canopy_bulk_backup_log',
    (priorLog && priorLog + "\n\n") +
    (`Old: ${fullPath}: ${fs.readFileSync(fullPath)}` + "\n\n" || '') +
    `${message}: ${fullPath}: ${newFileContents}`
  );
}

module.exports = reconstructProjectFiles;
