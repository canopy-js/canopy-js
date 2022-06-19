let fs = require('fs-extra');

function keyFromFile(fileText) {
  return (fileText.match(/^(?!-)([^:.,;]+):/)||{})[1] || null;
}

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

function validatePathsAreDirectories(directoryList) {
  directoryList.forEach((path) => {
    if (!fs.lstatSync(path).isDirectory()) throw "All path arguments must be directories";
  });
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

function getRecursiveSubdirectoryFiles(pathList) {
  return pathList.map(path => recursiveReadSync(path)).flat();
}

function getDirectoryFiles(pathList) {
  let results = [];

  pathList.forEach(path => {
    let contents = fs.readdirSync(path, { withFileTypes: true });
    let filteredContents = contents.filter((item) => item.isFile());
    let filteredPaths = filteredContents.map(item => `${path}/${item.name}`)
    results = results.concat(filteredPaths);
  });

  return results;
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

function fileWithoutFirstKey(string) {
  let key = keyFromFile(string);
  if (!key) return string;
  return string.slice(key.length + 2) // 2 for the key, plus colon, plus space.
}

module.exports = {
  keyFromFile,
  fileNameFor,
  takeDirectoryPath,
  recursiveDirectoryFind,
  validatePathsAreDirectories,
  deduplicate,
  getRecursiveSubdirectoryFiles,
  getDirectoryFiles,
  pathComparator,
  fileWithoutFirstKey
}
