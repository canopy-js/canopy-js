let fs = require('fs-extra');
let jsonForExplFile = require('./json_for_expl_file.js');
let {
  topicKeyOfString,
  listExplFilesRecursive,
  validateImportReferenceTargets,
  validateSubtopicDefinitions
} = require('./helpers');
let ParserState = require('./parser_state');
let Topic = require('../../shared/topic');

function jsonForProjectDirectory(projectDir, explFileData, makeFolders) {
  let sourceDirectory = `${projectDir}/topics`;
  let destinationBuildDirectory = `${projectDir}/build`
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let parserState = new ParserState(explFileData);
  let directoriesToEnsure = [];
  let filesToWrite = {};

  directoriesToEnsure.push(destinationDataDirectory);

  Object.keys(explFileData).forEach(function(path) {
    if (!topicKeyOfString(explFileData[path])) return;

    let json = jsonForExplFile(path, explFileData, parserState);
    let explFileNameWithoutExtension = path.match(/\/([^\/]+)\.expl$/)[1];
    let topic = new Topic(explFileNameWithoutExtension);

    let destinationPath = `${destinationDataDirectory}/${topic.fileName}.json`;

    if (process.env['CANOPY_LOGGING']) {
      console.log();
      console.log("WRITING TO " + destinationPath + ": " + json);
    }

    filesToWrite[destinationPath] = json;

    if (makeFolders) {
      let folderTopic = new Topic(topicKeyOfString(explFileData[path]));
      let topicFolderPath = destinationBuildDirectory + '/' + folderTopic.fileName;
      directoriesToEnsure(destinationBuildDirectory + '/' + folderTopic.fileName);
      if (process.env['CANOPY_LOGGING']) console.log('Created directory: ' + topicFolderPath);
    }
  });

  parserState.validateImportReferenceTargets();
  parserState.validateSubtopicDefinitions();
  parserState.validateImportReferenceGlobalMatching();

  return { directoriesToEnsure, filesToWrite }
}

module.exports = jsonForProjectDirectory;
