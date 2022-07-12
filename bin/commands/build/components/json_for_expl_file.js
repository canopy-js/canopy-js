let fs = require('fs');
let parseParagraph = require('./parse_paragraph');
let {
  paragraphsOfFile,
  extractKeyAndParagraph,
  validateRedundantLocalReferences,
  TopicName
} = require('./helpers');

function jsonForExplFile(path, namespaceObject, importReferencesToCheck, subtopicParents) {
  let paragraphsWithKeys = paragraphsOfFile(path);
  let tokenizedParagraphsByKey = {};
  let currentTopic = new TopicName(extractKeyAndParagraph(paragraphsWithKeys[0]).key);
  let redundantLocalReferences = [];

  paragraphsWithKeys.forEach(function(paragraphWithKey) {
    let paragraphData = extractKeyAndParagraph(paragraphWithKey);
    if (!paragraphData.key) { return; }
    let currentSubtopic = new TopicName(paragraphData.key);
    let textWithoutKey = paragraphData.paragraph;

    let tokensOfParagraph = parseParagraph(
      textWithoutKey,
      {
        topicSubtopics: namespaceObject,
        currentSubtopic,
        currentTopic,
        importReferencesToCheck,
        subtopicParents,
        redundantLocalReferences
      }
    );

    tokenizedParagraphsByKey[currentSubtopic] = tokensOfParagraph;
    // console.log(`Parsed [${currentTopic}, ${paragraphData.key}]`)
  });

  validateRedundantLocalReferences(subtopicParents, redundantLocalReferences);

  let jsonObject = {
    displayTopicName: currentTopic.display,
    paragraphsBySubtopic: tokenizedParagraphsByKey
  }

  return JSON.stringify(
    jsonObject,
    null,
    process.env.CANOPY_DEBUG ? 1 : 0
  );
}

module.exports = jsonForExplFile;
