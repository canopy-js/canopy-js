let fs = require('fs-extra');
let jsonForExplFile = require('./json_for_expl_file.js');
let {
  topicKeyOfString,
  listExplFilesRecursive,
  validateImportReferenceTargets,
  validateSubtopicDefinitions
} = require('./helpers');
let ParserContext = require('./parser_context');
let Topic = require('../../shared/topic');

function jsonForProjectDirectory(projectDir, explFileData, makeFolders) {
  let sourceDirectory = `${projectDir}/topics`;
  let destinationBuildDirectory = `${projectDir}/build`
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let parserContext = new ParserContext(explFileData);
  let directoriesToEnsure = [];
  let filesToWrite = {};

  directoriesToEnsure.push(destinationDataDirectory);

  Object.keys(explFileData).forEach(function(path) {
    if (!topicKeyOfString(explFileData[path])) return;

    let json = jsonForExplFile(path, explFileData, parserContext);
    let explFileNameWithoutExtension = path.match(/\/([^\/]+)\.expl$/)[1];
    let topic = new Topic(topicKeyOfString(explFileData[path]), true);
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

  parserContext.validateImportReferenceTargets();
  parserContext.validateSubtopicDefinitions();
  parserContext.validateImportReferenceGlobalMatching();

  return { directoriesToEnsure, filesToWrite }
}

module.exports = jsonForProjectDirectory;
