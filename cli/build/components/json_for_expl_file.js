let parseParagraph = require('./parse_paragraph');
let Topic = require('../../shared/topic');
let Block = require('../../shared/block');
let parseText = require('./parse_text');

function jsonForExplFile(filePath, explFileData, parserContext, options) {
  let paragraphsWithKeys = explFileData[filePath].trim().split(/\n\n/);
  let rootParagraph = new Block(paragraphsWithKeys[0]);
  let paragraphsBySubtopic = {};
  parserContext.filePath = filePath;

  paragraphsWithKeys.forEach(function(paragraphWithKey) {
    let paragraph = new Block(paragraphWithKey.trim());
    if (!paragraph.key) { return; }

    parserContext.setTopicAndSubtopic(Topic.for(rootParagraph.key), Topic.for(paragraph.key));
    parserContext.setLineNumberToCurrentSubtopic();
    if (!paragraph.newlineAfterDelimiter) parserContext.incrementCharacterNumber(paragraph.key.length + paragraph.charsAfterKey); // move cursor past key
    if (paragraph.newlineAfterDelimiter) parserContext.incrementLineAndResetCharacterNumber();

    let tokensOfParagraph = parseParagraph(paragraph.text, parserContext);

    paragraphsBySubtopic[parserContext.currentSubtopic.mixedCase] = tokensOfParagraph;
  });

  parserContext.validateRedundantLocalReferences();
  parserContext.throwSubsumptionConditionalErrors();
  parserContext.addFragmentReferenceSubtopics(subtopic => { paragraphsBySubtopic[subtopic.mixedCase] = [] });

  let jsonObject = {
    displayTopicName: rootParagraph.key,
    topicTokens: parseText({ text: rootParagraph.key, parserContext: parserContext.clone({ insideToken: true }) }), // ignore multi-line matchers
    paragraphsBySubtopic
  };

  return JSON.stringify(
    jsonObject,
    null,
    options.pretty ? 2 : 0
  );
}

module.exports = jsonForExplFile;
