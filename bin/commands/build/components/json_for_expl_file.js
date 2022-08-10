let fs = require('fs');
let parseParagraph = require('./parse_paragraph');
let {
  paragraphsOfFile,
  validateRedundantLocalReferences,
} = require('./helpers');
let Topic = require('../../shared/topic');
let Paragraph = require('../../shared/paragraph');

function jsonForExplFile(path, explFileData, parserContext) {
  let paragraphsWithKeys = explFileData[path].trim().split(/\n\n+/);
  let rootParagraph = new Paragraph(paragraphsWithKeys[0]);
  let currentTopicString = rootParagraph.key;
  let paragraphsBySubtopic = {};

  paragraphsWithKeys.forEach(function(paragraphWithKey) {
    let paragraph = new Paragraph(paragraphWithKey);
    if (!paragraph.key) { return; }

    parserContext.setTopicAndSubtopic(rootParagraph.key, paragraph.key);

    let tokensOfParagraph = parseParagraph(paragraph.text, parserContext);

    paragraphsBySubtopic[parserContext.currentSubtopic.mixedCase] = tokensOfParagraph;
  });

  parserContext.validateRedundantLocalReferences();

  let jsonObject = {
    displayTopicName: rootParagraph.key,
    paragraphsBySubtopic
  }

  return JSON.stringify(
    jsonObject,
    null,
    process.env.CANOPY_DEBUG ? 1 : 0
  );
}

module.exports = jsonForExplFile;
