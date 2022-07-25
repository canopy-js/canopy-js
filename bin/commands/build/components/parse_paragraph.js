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

function parseParagraph(text, parserState) {
  let linesContainerObjects = linesByBlockOf(text);

  let blockObjects = linesContainerObjects.map((linesContainerObject) => {
    if (linesContainerObject.type === 'text') {
      return textBlockFor(linesContainerObject.lines, parserState);
    } else if (linesContainerObject.type === 'code') {
      return codeBlockFor(linesContainerObject.lines);
    } else if (linesContainerObject.type === 'quote') {
      return quoteBlockFor(linesContainerObject.lines, parserState);
    } else if (linesContainerObject.type === 'list') {
      return listBlockFor(linesContainerObject.lines, parserState);
    } else if (linesContainerObject.type === 'table') {
      return tableBlockFor(linesContainerObject.lines, parserState);
    } else if (linesContainerObject.type === 'footnote') {
      return footnoteBlockFor(linesContainerObject.lines, parserState);
    }
  });

  return blockObjects;
}

module.exports = parseParagraph;
