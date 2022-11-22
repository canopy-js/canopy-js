// A set of files and their contents, grouped optionally by directory path
let pathLibrary = require('path');
let Topic = require('../shared/topic');
let Paragraph = require('../shared/paragraph');
let { getDefaultTopicAndPath } = require('./helpers');

class FileSet {
  constructor(fileContentsByPath) {
    this.filesObject = {};
    this.directoriesObject = {};
    this.fileContentsByPath = fileContentsByPath;

    Object.keys(fileContentsByPath).forEach(filePath => {
      let directoryPath = pathLibrary.dirname(filePath);

      let file = {
        path: filePath,
        contents: fileContentsByPath[filePath],
        key: (new Paragraph(fileContentsByPath[filePath])).key,
        directoryPath,
        terminalCategory: terminalCategoryofFilePath(filePath),
        categoryNotes: !!filePath.match(/([^\/]+)\/\1\.expl$/) // other extensions return null
      };

      this.filesObject[filePath] = file;

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
  return Topic.convertUnderscoresToSpaces(items[items.length - 2]);
}

function generateDisplayPath(directoryPath) {
  return directoryPath
    .match(/topics\/(.*)/)[1]
    .split('/')
    .map(segment => Topic.convertUnderscoresToSpaces(segment))
    .map(segment => (Topic.fromEncodedSlug(segment).mixedCase))
    .join('/');
}

module.exports = FileSet;
