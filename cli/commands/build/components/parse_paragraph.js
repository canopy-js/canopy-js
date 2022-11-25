let parseLine = require('./parse_line');
let { removeCircularListKeys, frontLoadImages } = require('./helpers');

function parseParagraph(text, parserContext) {
  let tokens = [];
  let lines = text.split("\n");

  lines.forEach(line => {
    tokens = parseLine(line, tokens, parserContext);
    parserContext.incrementLineNumber();
  });

  frontLoadImages(tokens);
  removeCircularListKeys(tokens);
  return tokens;
}

module.exports = parseParagraph;
