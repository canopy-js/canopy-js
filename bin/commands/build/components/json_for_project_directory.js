let fs = require('fs-extra');
let buildNamespaceObject = require('./build_namespace_object.js');
let jsonForExplFile = require('./json_for_expl_file.js');
let {
  topicKeyOfString,
  listExplFilesRecursive,
  validateImportReferenceTargets,
  validateSubtopicDefinitions
} = require('./helpers');

let { TopicName } = require('../../shared');

function jsonForProjectDirectory(projectDir, explFileData, makeFolders) {
  let sourceDirectory = `${projectDir}/topics`;
  let destinationBuildDirectory = `${projectDir}/build`
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let doubleDefinedSubtopics = [];
  let namespaceObject = buildNamespaceObject(explFileData, doubleDefinedSubtopics);
  let importReferencesToCheck = [];
  let subtopicParents = {};
  let directoriesToEnsure = [];
  let filesToWrite = {};

  directoriesToEnsure.push(destinationDataDirectory);

  Object.keys(explFileData).forEach(function(path) {
    if (!topicKeyOfString(explFileData[path])) return;

    let json = jsonForExplFile(path, explFileData, namespaceObject, importReferencesToCheck, subtopicParents);
    let explFileNameWithoutExtension = path.match(/\/([^\/]+)\.expl$/)[1];
    let topicName = new TopicName(explFileNameWithoutExtension);
    let fileName = topicName.fileName;

    let destinationPath = `${destinationDataDirectory}/${explFileNameWithoutExtension}.json`;

    if (process.env['CANOPY_LOGGING']) {
      console.log();
      console.log("WRITING TO " + destinationPath + ": " + json);
    }

    filesToWrite[destinationPath] = json;

    if (makeFolders) {
      let folderTopic = new TopicName(topicKeyOfString(explFileData[path]));
      let topicFolderPath = destinationBuildDirectory + '/' + folderTopic.slug;
      directoriesToEnsure(destinationBuildDirectory + '/' + folderTopic.slug);
      if (process.env['CANOPY_LOGGING']) console.log('Created directory: ' + topicFolderPath);
    }
  });

  validateImportReferenceTargets(importReferencesToCheck, subtopicParents);
  validateSubtopicDefinitions(doubleDefinedSubtopics, subtopicParents)
  return { directoriesToEnsure, filesToWrite }
}

module.exports = jsonForProjectDirectory;
