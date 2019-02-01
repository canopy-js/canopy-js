import recursiveReadSync from 'recursive-readdir-sync';
import fs from 'fs';

function listDgsfilesRecursive(rootDirectory) {
  let filePaths = recursiveReadSync(rootDirectory);

  filePaths = filePaths.filter(function(path){
    return path.endsWith('.dgs');
  });

  return filePaths;
}

export default listDgsfilesRecursive;
