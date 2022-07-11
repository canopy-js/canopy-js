let fs = require('fs');
let parseParagraph = require('./parse_paragraph');
let {
  paragraphsOfFile,
  validateRedundantLocalReferences,
  TopicName
} = require('./helpers');
let Paragraph = require('../shared/paragraph');

function jsonForExplFile(path, namespaceObject, importReferencesToCheck, subtopicParents) {
  let paragraphsWithKeys = paragraphsOfFile(path);
  let paragraphsBySubtopic = {};
  let paragraph = new Paragraph(paragraphsWithKeys[0]);
  let currentTopic = new TopicName(paragraph.key);
  let redundantLocalReferences = [];

  paragraphsWithKeys.forEach(function(paragraphWithKey) {
    let paragraph = new Paragraph(paragraphWithKey);
    if (!paragraph.key) { return; }
    let currentSubtopic = new TopicName(paragraph.key);
    let textWithoutKey = paragraph.paragraph;

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

    paragraphsBySubtopic[currentSubtopic.mixedCase] = tokensOfParagraph;
    // console.log(`Parsed [${currentTopic}, ${paragraph.key}]`)
  });

  validateRedundantLocalReferences(subtopicParents, redundantLocalReferences);

  let jsonObject = {
    displayTopicName: currentTopic.display,
    paragraphsBySubtopic
  }

  return JSON.stringify(
    jsonObject,
    null,
    process.env.CANOPY_DEBUG ? 1 : 0
  );
}

module.exports = jsonForExplFile;
