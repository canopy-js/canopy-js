// A set of files and their contents, grouped optionally by directory path
let pathLibrary = require('path');
let Topic = require('../shared/topic');
let Block = require('../shared/block');

class FileSet {
  constructor(fileContentsByPath) {
    this.filesObject = {};
    this.directoriesObject = {};
    this.fileContentsByPath = fileContentsByPath;

    Object.keys(fileContentsByPath).forEach(filePath => {
      let directoryPath = pathLibrary.dirname(filePath);

      let file = {
        path: filePath,
        fileName: filePath.split('/').slice(-1)[0],
        fileNameWithoutExtension: filePath.split('/').slice(-1)[0].match(/^(.*?)(\..*)?$/)[1],
        contents: fileContentsByPath[filePath],
        key: (new Block(fileContentsByPath[filePath])).key,
        directoryPath: directoryPath.replace(/\/#$/, '/\\#'),
        terminalCategory: terminalCategoryofFilePath(filePath)
      };

      this.filesObject[filePath] = file;

      // Add this file to the appropriate directory, or create new directory that contains it
      if (this.directoriesObject.hasOwnProperty(directoryPath)) {
        this.directoriesObject[directoryPath].files.push(file);
      } else {
        let displayPath = generateDisplayPath(directoryPath);

        this.directoriesObject[directoryPath] = {
          path: directoryPath,
          files: [file],
          displayPath
        };
      }

      // Add subpaths of this directory path to the directories list
      directoryPath = pathLibrary.dirname(directoryPath);
      while (directoryPath.includes('topics') && !directoryPath.endsWith('topics')) {
        if (!this.directoriesObject.hasOwnProperty(directoryPath)) {
          this.directoriesObject[directoryPath] = {
            path: directoryPath,
            files: [],
            displayPath: generateDisplayPath(directoryPath)
          };
        }
        directoryPath = pathLibrary.dirname(directoryPath);
      }
    });
  }

  get directories () {
    return Object.keys(this.directoriesObject)
      .map(path => this.directoriesObject[path])
  }

  get directoryPaths() {
    return Object.keys(this.directoriesObject)
      .map(path => this.directoriesObject[path].path)
  }

  get files() {
    return Object.keys(this.filesObject).
      map(path => this.filesObject[path]);
  }

  getFileContents(filePath) {
    return this.filesObject[filePath].contents;
  }

  hasFile(filePath) {
    return !!this.filesObject[filePath];
  }

  getDirectory(directoryPath) {
    return this.directoriesObject[directoryPath];
  }

  hasDirectory(directoryPath) {
    return !!this.directoriesObject[directoryPath];
  }

  get json() {
    return JSON.stringify(Object.keys(this.fileContentsByPath));
  }
}

function terminalCategoryofFilePath(filePath) {
  let items = filePath.split('/');
  return Topic.fromFileName(items[items.length - 2]).mixedCase;
}

function generateDisplayPath(directoryPath) {
  if (!directoryPath.match(/topics\/(.*)/)) return 'PLEASE ADD CATEGORY'; // eg .DS_STORE in root directory

  return directoryPath
    .match(/topics\/(.*)/)[1]
    .split('/')
    .map(segment => (Topic.fromFileName(segment).mixedCase))
    .join('/');
}

module.exports = FileSet;
