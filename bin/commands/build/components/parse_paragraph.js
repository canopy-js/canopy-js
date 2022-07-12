let { linesByBlockOf } = require('./helpers');
let { textToken } = require('./tokens');
let {
  textBlockFor,
  codeBlockFor,
  quoteBlockFor,
  listBlockFor,
  tableBlockFor,
  footnoteBlockFor
} = require('./block_parsers');

function parseParagraph(textWithoutKey, parsingContext) {
  let linesContainerObjects = linesByBlockOf(textWithoutKey);

  let blockObjects = linesContainerObjects.map((linesContainerObject) => {
    if (linesContainerObject.type === 'text') {
      return textBlockFor(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'code') {
      return codeBlockFor(linesContainerObject.lines);
    } else if (linesContainerObject.type === 'quote') {
      return quoteBlockFor(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'list') {
      return listBlockFor(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'table') {
      return tableBlockFor(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'footnote') {
      return footnoteBlockFor(linesContainerObject.lines, parsingContext);
    }
  });

  return blockObjects;
}

module.exports = parseParagraph;
