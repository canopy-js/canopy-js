let { linesByBlockOf } = require('./helpers');
let { textToken } = require('./tokens');
let parseLine = require('./parse_line');

function parseParagraph(text, parserContext) {
  let tokens = [];
  let lines = text.split("\n");

  lines.forEach(line => {
    parseLine(line, tokens, parserContext);
    parserContext.incrementLineNumber();
  });

  removeCircularKeys(tokens);

  return tokens;
}

function removeCircularKeys(tokens) {
  tokens.filter(token => token.type === 'list').forEach(token => {
    delete token.lastNode;
    token.topLevelNodes.forEach(node => removeExtraKeys(node))
  });
}

function removeExtraKeys(node) {
  delete node.parentNode;
  delete node.indentation;
  node.children.forEach(removeExtraKeys);
}

module.exports = parseParagraph;
