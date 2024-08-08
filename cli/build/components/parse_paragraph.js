let parseText = require('./parse_text');

function parseParagraph(text, parserContext) {
  let tokens = [];
  let lines = text.split("\n");
  parserContext.parseText = parseText; // avoids circular dependency when called from tokens code
  parserContext.paragraphText = text; // to determine global reference of import reference
  parserContext.paragraphReferences = []; // to determine global reference of import reference

  tokens = parseText({ text, parserContext, recursive: false });

  return tokens;
}

module.exports = parseParagraph;
