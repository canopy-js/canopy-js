let jsonForExplFile = require('./json_for_expl_file.js');
let { topicKeyOfString } = require('./simple-helpers');
let ParserContext = require('./parser_context');
let Topic = require('../../shared/topic');

function jsonForProjectDirectory(explFileData, newStatusData, defaultTopicString, options={}) {
  let destinationBuildDirectory = 'build';
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let parserContext = new ParserContext({ explFileData, defaultTopicString, options });
  let directoriesToEnsure = [];
  let filesToWrite = {};

  directoriesToEnsure.push(destinationDataDirectory);

  Object.keys(explFileData).forEach(function(filePath) {
    if (!topicKeyOfString(explFileData[filePath])) return;
    if (newStatusData && !newStatusData[filePath]) return; // with --cache we only build json for new expl files

    let json = jsonForExplFile(filePath, explFileData, parserContext, options);
    let topic = new Topic(topicKeyOfString(explFileData[filePath]), true);
    let destinationPath = `${destinationDataDirectory}/${topic.fileName}.json`;

    filesToWrite[destinationPath] = json;

    if (options.symlinks) {
      let folderTopic = new Topic(topicKeyOfString(explFileData[filePath]));
      let topicFolderPath = destinationBuildDirectory + '/' + folderTopic.fileName;
      directoriesToEnsure.push(destinationBuildDirectory + '/' + folderTopic.fileName);
    }
  });

  parserContext.validateSubtopicDefinitions();
  parserContext.validateGlobalReferences();
  if (options.orphans) parserContext.logGlobalOrphans();
  if (options.orphans) parserContext.logLocalOrphans();

  return { directoriesToEnsure, filesToWrite };
}

module.exports = jsonForProjectDirectory;
