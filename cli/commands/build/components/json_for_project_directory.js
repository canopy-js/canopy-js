let jsonForExplFile = require('./json_for_expl_file.js');
let { topicKeyOfString } = require('./helpers');
let ParserContext = require('./parser_context');
let Topic = require('../../shared/topic');

function jsonForProjectDirectory(explFileData, defaultTopicString, options) {
  let destinationBuildDirectory = 'build';
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

    filesToWrite[destinationPath] = json;

    if (options.symlinks) {
      let folderTopic = new Topic(topicKeyOfString(explFileData[path]));
      let topicFolderPath = destinationBuildDirectory + '/' + folderTopic.fileName;
      directoriesToEnsure.push(destinationBuildDirectory + '/' + folderTopic.fileName);
    }
  });

  parserContext.validateImportReferenceTargets();
  parserContext.validateSubtopicDefinitions();
  parserContext.validateImportReferenceGlobalMatching();
  if (options.orphans) parserContext.logGlobalOrphans();
  if (options.orphans) parserContext.logLocalOrphans();
  if (options.reciprocals) parserContext.logNonReciprocals();

  return { directoriesToEnsure, filesToWrite };
}

module.exports = jsonForProjectDirectory;
