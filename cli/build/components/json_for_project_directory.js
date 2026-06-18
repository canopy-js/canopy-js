let jsonForExplFile = require('./json_for_expl_file.js');
let { topicKeyOfString } = require('./simple-helpers');
let ParserContext = require('./parser_context');
let Topic = require('../../shared/topic');
let { staticBuildPath } = require('../../shared/build_paths');

function jsonForProjectDirectory(explFileObjectsByPath, defaultTopicString, options={}) {
  let destinationDataDirectory = staticBuildPath('_data');
  let parserContext = new ParserContext({ explFileObjectsByPath, defaultTopicString, options });
  let directoriesToEnsure = [];
  let filesToWrite = {};

  directoriesToEnsure.push(destinationDataDirectory);

  Object.keys(explFileObjectsByPath).forEach(function(filePath) {
    const fileObject = explFileObjectsByPath[filePath];
    const topicKey = topicKeyOfString(fileObject.contents);
    if (!topicKey || !fileObject.isNew) return;

    let json = jsonForExplFile(filePath, explFileObjectsByPath, parserContext, options);
    let topic = new Topic(topicKey, true);
    let destinationPath = `${destinationDataDirectory}/${topic.jsonFileName}.json`;

    filesToWrite[destinationPath] = json;

    if (options.symlinks) {
      let folderTopic = new Topic(topicKey);
      directoriesToEnsure.push(staticBuildPath(folderTopic.topicFileName));
    }
  });

  if (options.orphans) parserContext.logGlobalOrphans();
  if (options.orphans) parserContext.logLocalOrphans();
  parserContext.validateGlobalReferences();

  return { directoriesToEnsure, filesToWrite };
}

module.exports = jsonForProjectDirectory;
