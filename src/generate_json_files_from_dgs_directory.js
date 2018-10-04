var fs = require('fs');
var findRecursiveDgsFilesOfDirectory = require('./file_system/find_recursive_dgs_files_of_directory');
var buildNamespaceObject = require('./namespace_generation/build_namespace_object.js');
var generateJsonForDgsFile = require('./parser/generate_json_for_dgs_file.js');

function generateJsonFilesFromDgsDirectory(sourceDirectory, destinationDirectory) {
  var dgsFilePaths = findRecursiveDgsFilesOfDirectory(sourceDirectory);
  var namespaceObject =  buildNamespaceObject(dgsFilePaths);
  dgsFilePaths.forEach(function(path) {
    var json = generateJsonForDgsFile(path);
    var dgsFileNameWithoutExtension = path.match(/\/(\w+)\.\w+$/)[1];

    if (!fs.existsSync(destinationDirectory)){
        fs.mkdirSync(destinationDirectory);
    }

    var destinationPath = destinationDirectory + '/' + dgsFileNameWithoutExtension + '.json';
    console.log("WRITING TO " + destinationPath + ": " + json);
    fs.writeFileSync(destinationPath, json);
  });
}

module.exports = generateJsonFilesFromDgsDirectory;
