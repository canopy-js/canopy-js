let fs = require('fs-extra');
let buildNamespaceObject = require('./build_namespace_object.js');
let jsonForExplFile = require('./json_for_expl_file.js');
let {
  topicKeyOfFile,
  listExplFilesRecursive,
  validateImportReferenceTargets
} = require('./helpers');

let { TopicName } = require('../../shared');

function generateJsonForProjectDirectory(sourceDirectory, destinationBuildDirectory, makeFolders) {
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let explFilePaths = listExplFilesRecursive(sourceDirectory);
  let namespaceObject = buildNamespaceObject(explFilePaths);
  let importReferencesToCheck = [];
  let subtopicParents = {};

  fs.ensureDirSync(destinationDataDirectory);

  explFilePaths.forEach(function(path) {
    if (!topicKeyOfFile(path)) return;

    let json = jsonForExplFile(path, namespaceObject, importReferencesToCheck, subtopicParents);
    let explFileNameWithoutExtension = path.match(/\/([^\/]+)\.expl$/)[1];
    let topicName = new TopicName(explFileNameWithoutExtension);
    let fileName = topicName.fileName;

    let destinationPath = `${destinationDataDirectory}/${explFileNameWithoutExtension}.json`;

    if (process.env['CANOPY_LOGGING']) {
      console.log();
      console.log("WRITING TO " + destinationPath + ": " + json);
    }

    fs.rmSync(destinationDataDirectory, { force: true, recursive: true });
    fs.ensureDirSync(destinationDataDirectory);
    fs.writeFileSync(destinationPath, json);

    if (makeFolders) {
      let folderTopic = new TopicName(topicKeyOfFile(path));
      let topicFolderPath = destinationBuildDirectory + '/' + folderTopic.slug;
      fs.ensureDirSync(destinationBuildDirectory + '/' + folderTopic.slug);
      if (process.env['CANOPY_LOGGING']) console.log('Created directory: ' + topicFolderPath);
    }
  });

  validateImportReferenceTargets(importReferencesToCheck, subtopicParents);
}

module.exports = generateJsonForProjectDirectory;
