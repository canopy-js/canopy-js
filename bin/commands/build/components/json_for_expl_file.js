let fs = require('fs');
let parseParagraph = require('./parse_paragraph');
let {
  paragraphsOfFile,
  extractKeyAndParagraph,
  removeMarkdownTokens,
  validateRedundantLocalReferences
} = require('./helpers');

function jsonForExplFile(path, namespaceObject, importReferencesToCheck, subtopicParents) {
  let paragraphsWithKeys = paragraphsOfFile(path);
  let tokenizedParagraphsByKey = {};
  let displayTopicOfFile = extractKeyAndParagraph(paragraphsWithKeys[0]).key;
  let topicOfFile = removeMarkdownTokens(displayTopicOfFile).toUpperCase();
  let redundantLocalReferences = [];

  paragraphsWithKeys.forEach(function(paragraphWithKey) {
    let paragraphData = extractKeyAndParagraph(paragraphWithKey);
    if (!paragraphData.key) { return; }
    let currentSubtopic = removeMarkdownTokens(paragraphData.key);
    let currentSubtopicCaps = currentSubtopic.toUpperCase();
    let textWithoutKey = paragraphData.paragraph;

    let tokensOfParagraph = parseParagraph(
      textWithoutKey,
      {
        topicSubtopics: namespaceObject,
        currentSubtopicCaps,
        currentTopicCaps: topicOfFile,
        importReferencesToCheck,
        subtopicParents,
        redundantLocalReferences
      }
    );

    tokenizedParagraphsByKey[currentSubtopic] = tokensOfParagraph;
    // console.log(`Parsed [${topicOfFile}, ${paragraphData.key}]`)
  });

  validateRedundantLocalReferences(subtopicParents, redundantLocalReferences);

  let jsonObject = {
    displayTopicName: displayTopicOfFile,
    paragraphsBySubtopic: tokenizedParagraphsByKey
  }

  return JSON.stringify(
    jsonObject,
    null,
    process.env.CANOPY_DEBUG ? 1 : 0
  );
}

module.exports = jsonForExplFile;
