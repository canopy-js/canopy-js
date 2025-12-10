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

function updateFileSystem(directoriesToEnsure, filesToWrite, options = {}) {
  directoriesToEnsure.forEach(directoryPath => {
    fs.ensureDirSync(directoryPath);
    if (options.logging) console.log(chalk.yellow('Created directory: ' + directoryPath));
  });

  Object.keys(filesToWrite).forEach(filePath => {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath);
    const lower = base.toLowerCase();

    // delete any case-variant
    fs.readdirSync(dir).forEach(name => {
      if (name.toLowerCase() === lower && name !== base) {
        fs.unlinkSync(path.join(dir, name));
      }
    });

    fs.writeFileSync(filePath, filesToWrite[filePath]);
  });

  const n = Object.keys(filesToWrite).length;
  if (options.logging) console.log(chalk.yellow(`Created ${n} JSON ${n === 1 ? 'file' : 'files'} in build/_data${n === 1 ? ` - ${Object.keys(filesToWrite)[0]}` : ''}`));
}

function getExplFileObjects(topicsPath, options = {}) {
  const buildDirectoryExists = fs.existsSync('./build/_data/');
  let jsonModDatesMap = {};

  if (options.cache && buildDirectoryExists) {
    jsonModDatesMap = Object.fromEntries(
      listFilesWithModificationDatesSync('./build/_data/').map(({ fileName, lastModified }) => [
        fileName, lastModified
      ])
    );
  }

  const explFilePaths = listExplFilesRecursive(topicsPath);

  return Object.fromEntries(
    explFilePaths.map(fullPath => {
      const filePath = path.relative('.', fullPath);
      const contents = fs.readFileSync(fullPath, 'utf8');
      const stats = fs.statSync(fullPath);
      const modTime = stats.mtime.getTime();

      let isNew = true; // if cache is false, everything is marked new
      const key = topicKeyOfString(contents);

      if (key && options.cache && buildDirectoryExists) {
        const jsonFileName = Topic.for(key).jsonFileName + '.json';
        const jsonLastModified = jsonModDatesMap[jsonFileName];
        if (jsonLastModified) {
          isNew = stats.mtime > jsonLastModified;
        }
      }

      return [filePath, { contents, isNew, modTime }];
    })
  );
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
  updateFileSystem,
  getExplFileObjects
};
