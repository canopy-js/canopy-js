let jsonForExplFile = require('./json_for_expl_file.js');
let { topicKeyOfString } = require('./helpers');
let ParserContext = require('./parser_context');
let Topic = require('../../shared/topic');

function jsonForProjectDirectory(projectDir, explFileData, defaultTopicString, options) {
  let destinationBuildDirectory = `${projectDir}/build`;
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let parserContext = new ParserContext(explFileData, defaultTopicString);
  let directoriesToEnsure = [];
  let filesToWrite = {};

  directoriesToEnsure.push(destinationDataDirectory);

  Object.keys(explFileData).forEach(function(path) {
    if (!topicKeyOfString(explFileData[path])) return;

    let json = jsonForExplFile(path, explFileData, parserContext, options);
    let topic = new Topic(topicKeyOfString(explFileData[path]), true);
    let destinationPath = `${destinationDataDirectory}/${topic.fileName}.json`;

    if (options.logging) {
      console.log("Writing to: " + destinationPath);
    }

    filesToWrite[destinationPath] = json;

    if (options.makeFolders) {
      let folderTopic = new Topic(topicKeyOfString(explFileData[path]));
      let topicFolderPath = destinationBuildDirectory + '/' + folderTopic.fileName;
      directoriesToEnsure(destinationBuildDirectory + '/' + folderTopic.fileName);
      if (options.logging) console.log('Created directory: ' + topicFolderPath);
    }
  });

  if (options.logging) console.log();
  parserContext.validateImportReferenceTargets();
  parserContext.validateSubtopicDefinitions();
  parserContext.validateImportReferenceGlobalMatching();
  if (options.logging) parserContext.logGlobalOrphans();
  if (options.logging) parserContext.logLocalOrphans();

  return { directoriesToEnsure, filesToWrite };
}

module.exports = jsonForProjectDirectory;
