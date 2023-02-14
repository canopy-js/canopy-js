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

    parserContext.setTopicAndSubtopic(new Topic(rootParagraph.key), new Topic(paragraph.key));
    parserContext.setLineNumberToCurrentSubtopic();
    if (!paragraph.newlineAfterDelimiter) parserContext.incrementCharacterNumber(paragraph.key.length + paragraph.charsAfterKey); // move cursor from last key char to first text char
    if (paragraph.newlineAfterDelimiter) parserContext.incrementLineNumber();

    let tokensOfParagraph = parseParagraph(paragraph.text, parserContext);

    paragraphsBySubtopic[parserContext.currentSubtopic.mixedCase] = tokensOfParagraph;
  });

  parserContext.validateRedundantLocalReferences();

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
