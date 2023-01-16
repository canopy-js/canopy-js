let parseText = require('./parse_text');

function parseParagraph(text, parserContext) {
  let tokens = [];
  let lines = text.split("\n");
  parserContext.parseText = parseText; // avoids circular dependency when called from tokens code

  tokens = parseText({ text, parserContext, preserveNewlines: false, recursive: false });

  return tokens;
}

module.exports = parseParagraph;
