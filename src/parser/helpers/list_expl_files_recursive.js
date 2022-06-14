import recursiveReadSync from 'recursive-readdir-sync';
import fs from 'fs';

function listExplFilesRecursive(rootDirectory) {
  let filePaths = recursiveReadSync(rootDirectory);

  filePaths = filePaths.filter(function(path){
    return path.endsWith('.expl');
  });

  return filePaths;
}

export default listExplFilesRecursive;
