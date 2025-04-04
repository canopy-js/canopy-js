let jsonForExplFile = require('./json_for_expl_file.js');
let { topicKeyOfString } = require('./simple-helpers');
let ParserContext = require('./parser_context');
let Topic = require('../../shared/topic');

function jsonForProjectDirectory(explFileObjects, defaultTopicString, options={}) {
  const explFileStrings = Object.fromEntries(Object.entries(explFileObjects).map(([k, v]) => [k, typeof v === 'object' ? v.contents : v]));
  let destinationBuildDirectory = 'build';
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let parserContext = new ParserContext({ explFileStrings, defaultTopicString, options });
  let directoriesToEnsure = [];
  let filesToWrite = {};

  directoriesToEnsure.push(destinationDataDirectory);

  Object.keys(explFileObjects).forEach(function(filePath) {
    if (!topicKeyOfString(explFileStrings[filePath])) return;
    if (typeof Object.values(explFileObjects)[0] === 'object' && !explFileObjects[filePath]?.isNew) return;

    let json = jsonForExplFile(filePath, explFileStrings, parserContext, options);
    let topic = new Topic(topicKeyOfString(explFileStrings[filePath]), true);
    let destinationPath = `${destinationDataDirectory}/${topic.jsonFileName}.json`;

    filesToWrite[destinationPath] = json;

    if (options.symlinks) {
      let folderTopic = new Topic(topicKeyOfString(explFileStrings[filePath]));
      directoriesToEnsure.push(destinationBuildDirectory + '/' + folderTopic.topicFileName);
    }
  });

  if (options.orphans) parserContext.logGlobalOrphans();
  if (options.orphans) parserContext.logLocalOrphans();
  if (!options.cache) parserContext.validateGlobalReferences();

  return { directoriesToEnsure, filesToWrite };
}

module.exports = jsonForProjectDirectory;
