import fs from 'fs';
import listDgsFilesRecursive from 'helpers/list_dgs_files_recursive.js';
import buildNamespaceObject from 'components/build_namespace_object.js';
import jsonForDgsFile from 'components/json_for_dgs_file.js';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';

function jsonForDgsDirectory(sourceDirectory, destinationDirectory) {
  var dgsFilePaths = listDgsFilesRecursive(sourceDirectory);
  var namespaceObject = buildNamespaceObject(dgsFilePaths);

  dgsFilePaths.forEach(function(path) {
    var json = jsonForDgsFile(path, namespaceObject);
    var dgsFileNameWithoutExtension = path.match(/\/(\w+)\.\w+$/)[1];

    if (!fs.existsSync(destinationDirectory)){
        fs.mkdirSync(destinationDirectory);
    }

    if(dgsFileNameWithoutExtension.includes(' ')){
      throw 'Data filenames may not contain spaces: ' + path;
    }

    var destinationPath = destinationDirectory + '/' + dgsFileNameWithoutExtension + '.json';
    console.log();
    console.log("WRITING TO " + destinationPath + ": " + json);
    fs.writeFileSync(destinationPath, json);
  });
}

export default jsonForDgsDirectory;
