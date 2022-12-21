let parseLine = require('./parse_line');
let { postProcess } = require('./helpers');

function parseParagraph(text, parserContext) {
  let tokens = [];
  let lines = text.split("\n");

  lines.forEach((line, index) => {
    parserContext.lastLine = index === lines.length - 1;
    tokens = parseLine(line, tokens, parserContext);
    parserContext.incrementLineNumber();
  });

  tokens = postProcess(tokens);
  return tokens;
}

module.exports = parseParagraph;
