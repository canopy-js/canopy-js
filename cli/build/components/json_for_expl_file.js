let parseParagraph = require('./parse_paragraph');
let Topic = require('../../shared/topic');
let Paragraph = require('../../shared/paragraph');
let parseText = require('./parse_text');

function jsonForExplFile(filePath, explFileData, parserContext, options) {
  let paragraphsWithKeys = explFileData[filePath].trim().split(/\n\n/);
  let rootParagraph = new Paragraph(paragraphsWithKeys[0]);
  let paragraphsBySubtopic = {};
  parserContext.filePath = filePath;

  paragraphsWithKeys.forEach(function(paragraphWithKey) {
    let paragraph = new Paragraph(paragraphWithKey.trim());
    if (!paragraph.key) { return; }

    parserContext.setTopicAndSubtopic(Topic.for(rootParagraph.key), Topic.for(paragraph.key));
    parserContext.setLineNumberToCurrentSubtopic();
    if (!paragraph.newlineAfterDelimiter) parserContext.incrementCharacterNumber(paragraph.key.length + paragraph.charsAfterKey); // move cursor past key
    if (paragraph.newlineAfterDelimiter) parserContext.incrementLineAndResetCharacterNumber();

    let tokensOfParagraph = parseParagraph(paragraph.text, parserContext);

    paragraphsBySubtopic[parserContext.currentSubtopic.mixedCase] = tokensOfParagraph;
  });

  parserContext.validateRedundantLocalReferences();
  parserContext.validateAmbiguousLocalReferences();

  let jsonObject = {
    displayTopicName: rootParagraph.key,
    topicTokens: parseText({ text: rootParagraph.key, parserContext: parserContext.clone({ insideToken: true }) }),
    paragraphsBySubtopic
  };

  return JSON.stringify(
    jsonObject,
    null,
    options.logging ? 1 : 0
  );
}

module.exports = jsonForExplFile;
