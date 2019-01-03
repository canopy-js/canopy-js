let recursiveReadSync = require('recursive-readdir-sync');
let fs = require('fs');

function listDgsfilesRecursive(rootDirectory) {
  let filePaths = recursiveReadSync(rootDirectory);

  filePaths = filePaths.filter(function(path){
    return path.endsWith('.dgs');
  });

  return filePaths;
}

export default listDgsfilesRecursive;
