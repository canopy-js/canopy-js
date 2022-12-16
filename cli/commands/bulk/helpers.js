let fs = require('fs-extra');
let recursiveReadSync = require('recursive-readdir-sync');

function fileNameFor(string) {
  return string.replace(/ /g, '_').toLowerCase();
}

function takeDirectoryPath(path) {
  return (path.match(/topics\/(.+)\/.+\.expl/)||{})[1];
}

function recursiveDirectoryFind(path, results) {
  results = results || [];

  let files = fs.readdirSync(path, { withFileTypes: true });

  let subdirectories = files
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  subdirectories.forEach((subdirectory) => {
    results.push(`${path}/${subdirectory}`);
    recursiveDirectoryFind(`${path}/${subdirectory}`, results);
  });

  return results;
}

function deduplicate(pathList) {
  let uniquePaths = [];
  pathList.forEach((path) => {
    if (!uniquePaths.includes(path)) {
      uniquePaths.push(path);
    }
  });
  return uniquePaths;
}

function getRecursiveSubdirectoryFiles(path) {
  return recursiveReadSync(path).flat();
}

function getDirectoryFiles(path) {
  let contents = fs.readdirSync(path, { withFileTypes: true });
  let filteredContents = contents.filter((item) => item.isFile());
  let filteredPaths = filteredContents.map(item => `${path}/${item.name}`);
  return filteredPaths;
}

function getAllFileAndDirectoryPathsRecursive(path) {
  return recursiveDirectoryFind(path).concat(getRecursiveSubdirectoryFiles(path)).filter(path => path !== 'topics');
}

function allFilesAndDirectoriesOf(pathArray) {
  let result = [];
  pathArray.forEach(path => {
    result.push(path);
    let directoryPathSegments = path.split('/').slice(0, -1); // skip the file name
    for (let i = directoryPathSegments.length; i > 1; i--) { // skip the path 'topics'
      let directoryPath = directoryPathSegments.slice(0, i).join('/');
      if (!result.includes(directoryPath)) result.push(directoryPath);
    }
  });
  return result;
}

function groupByPath(fileList) {
  return fileList.reduce((collection, filePath) => {
    let directoryPath = filePath.split('/').slice(0, -1).join('/');
    collection[directoryPath] = collection[directoryPath] || [];
    collection[directoryPath].push(filePath);
    return collection;
  }, {});
}

class CyclePreventer {
  constructor() {
    this.ignoreNextTopicsChangeBoolean = false;
    this.ignoreNextBulkFileChangeBoolean = false;
    this.watchingTopicsBoolean = false;
    this.watchingBulkFileBoolean = false;
  }

  ignoreNextBulkFileChange() {
    if (this.watchingBulkFileBoolean) {
      this.ignoreNextBulkFileChangeBoolean = true;
    }
  }

  ignoreNextTopicsChange() {
    if (this.watchingTopicsBoolean) {
      this.ignoreNextTopicsChangeBoolean = true;
    }
  }

  watchingTopics () {
    this.watchingTopicsBoolean = true;
  }

  watchingBulkFile() {
    this.watchingBulkFileBoolean = true;
  }

  ignoreTopicsChange() {
    return this.ignoreNextTopicsChangeBoolean;
  }

  ignoreBulkFileChange() {
    return this.ignoreNextBulkFileChangeBoolean;
  }

  respondToNextTopicsChange() {
    this.ignoreNextTopicsChangeBoolean = false;
  }

  respondToNextBulkFileChange() {
    this.ignoreNextBulkFileChangeBoolean = false;
  }
}

module.exports = {
  fileNameFor,
  takeDirectoryPath,
  recursiveDirectoryFind,
  deduplicate,
  getRecursiveSubdirectoryFiles,
  getDirectoryFiles,
  groupByPath,
  getAllFileAndDirectoryPathsRecursive,
  allFilesAndDirectoriesOf,
  CyclePreventer
};
