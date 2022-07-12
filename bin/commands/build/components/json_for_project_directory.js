let fs = require('fs-extra');
let buildProvisionalNamespaceObject = require('./build_provisional_namespace_object.js');
let jsonForExplFile = require('./json_for_expl_file.js');
let {
  slugFor,
  topicKeyOfFile,
  listExplFilesRecursive,
  validateImportReferenceTargets,
  validateJsonFileName
} = require('./helpers');

function generateJsonForProjectDirectory(sourceDirectory, destinationBuildDirectory, makeFolders) {
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let explFilePaths = listExplFilesRecursive(sourceDirectory);
  let namespaceObject = buildProvisionalNamespaceObject(explFilePaths);
  let importReferencesToCheck = [];
  let subtopicParents = {};

  fs.rmSync(destinationDataDirectory, { recursive: true, force: true });
  fs.mkdirSync(destinationDataDirectory);

  explFilePaths.forEach(function(path) {
    if (!topicKeyOfFile(path)) return;

    let json = jsonForExplFile(path, namespaceObject, importReferencesToCheck, subtopicParents);
    let explFileNameWithoutExtension = path.match(/\/([^\/]+)\.expl$/)[1];
    validateJsonFileName(explFileNameWithoutExtension);

    let destinationPath = `${destinationDataDirectory}/${explFileNameWithoutExtension}.json`;

    if (process.env['CANOPY_LOGGING']) {
      console.log();
      console.log("WRITING TO " + destinationPath + ": " + json);
    }

    fs.ensureDir(destinationDataDirectory);
    fs.writeFileSync(destinationPath, json);

    if (makeFolders) {
      let capitalizedKeySlug = slugFor(topicKeyOfFile(path));
      let topicFolderPath = destinationBuildDirectory + '/' + capitalizedKeySlug;
      fs.rmSync(topicFolderPath, { recursive: true, force: true });
      fs.mkdirSync(destinationBuildDirectory + '/' + capitalizedKeySlug);
      if (process.env['CANOPY_LOGGING']) console.log('Created directory: ' + topicFolderPath);
    }
  });

  validateImportReferenceTargets(importReferencesToCheck, subtopicParents);
}

module.exports = generateJsonForProjectDirectory;
