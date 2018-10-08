import fs from 'fs';
import listDgsFilesRecursive from '../helpers/list_dgs_files_recursive.js';
import buildNamespaceObject from './build_namespace_object.js';
import generateJsonForDgsFile from './generate_json_for_dgs_file.js';

function generateJsonFilesFromDgsDirectory(sourceDirectory, destinationDirectory) {
  var dgsFilePaths = listDgsFilesRecursive(sourceDirectory);
  var namespaceObject = buildNamespaceObject(dgsFilePaths);

  dgsFilePaths.forEach(function(path) {
    var json = generateJsonForDgsFile(path, namespaceObject);
    var dgsFileNameWithoutExtension = path.match(/\/(\w+)\.\w+$/)[1];

    if (!fs.existsSync(destinationDirectory)){
        fs.mkdirSync(destinationDirectory);
    }

    var destinationPath = destinationDirectory + '/' + dgsFileNameWithoutExtension + '.json';
    console.log();
    console.log("WRITING TO " + destinationPath + ": " + json);
    fs.writeFileSync(destinationPath, json);
  });
}

export default generateJsonFilesFromDgsDirectory;
