let fs = require('fs-extra');
let recursiveReadSync = require('recursive-readdir-sync');

function fileNameFor(string) {
  return string.replace(/ /g, '_').toLowerCase();
}

function takeDirectoryPath(path) {
  return (path.match(/topics\/(.+)\/.+\.expl/)||{})[1];
};

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
  return uniquePaths
}

function getRecursiveSubdirectoryFiles(path) {
  return recursiveReadSync(path).flat();
}

function getDirectoryFiles(path) {
  let contents = fs.readdirSync(path, { withFileTypes: true });
  let filteredContents = contents.filter((item) => item.isFile());
  let filteredPaths = filteredContents.map(item => `${path}/${item.name}`)
  return filteredPaths;
}

function pathComparator(path1, path2) {
  let directoryPath1 = takeDirectoryPath(path1); // topics/ [A/B/C] /C.expl
  let directoryPath2 = takeDirectoryPath(path2);

  if (directoryPath1 > directoryPath2) {
    return 1;
  } else if (directoryPath1 < directoryPath2) {
    return -1
  }
}

function groupByPath(fileList) {
  return fileList.reduce((collection, filePath) => {
    let directoryPath = filePath.split('/').slice(0, -1).join('/');
    collection[directoryPath] = collection[directoryPath] || [];
    collection[directoryPath].push(filePath)
    return collection;
  }, {});
}

module.exports = {
  fileNameFor,
  takeDirectoryPath,
  recursiveDirectoryFind,
  deduplicate,
  getRecursiveSubdirectoryFiles,
  getDirectoryFiles,
  pathComparator,
  groupByPath
}