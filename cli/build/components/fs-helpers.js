let recursiveReadSync = require('recursive-readdir-sync');
let fs = require('fs-extra');
let Topic = require('../../shared/topic');
let { TextToken } = require('./tokens');
let chalk = require('chalk');

function listExplFilesRecursive(rootDirectory) {
  let filePaths = recursiveReadSync(rootDirectory);

  filePaths = filePaths.filter(function(path){
    return path.endsWith('.expl');
  });

  return filePaths;
}

function updateFilesystem(directoriesToEnsure, filesToWrite, options = {}) {
  directoriesToEnsure.forEach(directoryPath => {
    fs.ensureDirSync(directoryPath);
    if (options.logging) console.log(chalk.yellow('Created directory: ' + directoryPath));
  });

  Object.keys(filesToWrite).forEach(filePath => {
    fs.writeFileSync(filePath, filesToWrite[filePath]);
  });

  if (options.logging) console.log(chalk.yellow(`Created ${Object.keys(filesToWrite).length} JSON files in build/_data`));
}

function getExplFileData(topicsPath) {
  let explFilePaths = listExplFilesRecursive(topicsPath);
  return explFilePaths.reduce((fileData, filePath) => {
    fileData[filePath] = fs.readFileSync(filePath, 'utf8');
    return fileData;
  }, {});
}

module.exports = {
  listExplFilesRecursive,
  updateFilesystem,
  getExplFileData
};
