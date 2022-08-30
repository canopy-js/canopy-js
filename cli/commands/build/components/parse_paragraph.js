let parseLine = require('./parse_line');
let { removeCircularListKeys } = require('./helpers');

function parseParagraph(text, parserContext) {
  let tokens = [];
  let lines = text.split("\n");

  lines.forEach(line => {
    parseLine(line, tokens, parserContext);
    parserContext.incrementLineNumber();
  });

  removeCircularListKeys(tokens);
  return tokens;
}

module.exports = parseParagraph;
