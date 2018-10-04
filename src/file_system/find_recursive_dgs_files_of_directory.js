var recursiveReadSync = require('recursive-readdir-sync');
var fs = require('fs');

function findRecursiveDgsFilesOfDirectory(rootDirectory) {
  var filePaths = recursiveReadSync(rootDirectory);

  filePaths = filePaths.filter(function(path){
    return path.endsWith('.dgs');
  });

  return filePaths;
}

module.exports = findRecursiveDgsFilesOfDirectory;
