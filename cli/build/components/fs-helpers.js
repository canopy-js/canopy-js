let recursiveReadSync = require('recursive-readdir-sync');
let fs = require('fs-extra');
let Topic = require('../../shared/topic');
let chalk = require('chalk');
let { topicKeyOfString } = require('./simple-helpers');
const path = require('path');

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

function getExplFileData(topicsPath, options) {
  let buildDirectoryExists = fs.existsSync('./build/_data/');
  let jsonModDatesMap = {};

  if (options.cache && buildDirectoryExists) {
    // Get modification dates for JSON files
    let jsonFilesWithModDates = listFilesWithModificationDatesSync('./build/_data/');
    jsonModDatesMap = jsonFilesWithModDates.reduce((acc, { fileName, lastModified }) => {
      acc[fileName] = lastModified;
      return acc;
    }, {});
  }

  let explFilePaths = listExplFilesRecursive(topicsPath);
  let fileContentsObject = {};
  let newStatusObject = {};

  explFilePaths.forEach(filePath => {
    let topicFileContents = fs.readFileSync(filePath, 'utf8');
    let key = topicKeyOfString(topicFileContents);
    if (!key) return;

    let jsonFileName = Topic.for(key).jsonFileName + '.json';

    let isNew = true; // Assume the file is new unless proven otherwise
    if (options.cache && buildDirectoryExists) {
      let jsonFilePath = path.join('./build/_data/', jsonFileName);
      if (fs.existsSync(jsonFilePath)) {
        let explFileStats = fs.statSync(filePath);
        let jsonFileLastModified = jsonModDatesMap[jsonFileName];
        isNew = explFileStats.mtime > jsonFileLastModified;
      }
    }

    // Mapping file path to its contents
    fileContentsObject[filePath] = topicFileContents;
    // Mapping file path to its new status
    newStatusObject[filePath] = isNew;
  });

  return [fileContentsObject, newStatusObject];
}

function listFilesWithModificationDatesSync(directoryPath) {
  try {
    // Synchronously read the directory contents
    const fileNames = fs.readdirSync(directoryPath);
    const filesWithDates = [];

    for (const fileName of fileNames) {
      const filePath = path.join(directoryPath, fileName);
      // Synchronously get file stats
      const stats = fs.statSync(filePath);
      filesWithDates.push({
        fileName: fileName,
        lastModified: stats.mtime // mtime is the last modified time
      });
    }

    return filesWithDates;
  } catch (error) {
    console.error('Error reading directory:', error);
    return []; // Return an empty array in case of an error
  }
}

module.exports = {
  listExplFilesRecursive,
  updateFilesystem,
  getExplFileData
};
