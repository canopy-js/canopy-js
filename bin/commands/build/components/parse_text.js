let Matchers = require('./matchers');
let { TextToken } = require('./tokens');

function parseText(text, parserContext) {
  let tokens = [];
  parserContext.currentText = text;
  parserContext.currentTokens = tokens;

  let characters = text.split('');
  let buffer = '';

  for (let i = 0; i < characters.length; i++) {
    let string = characters.slice(i).join('');
    let result;
    for (let j = 0; j < Matchers.length; j++) {
      result = Matchers[j](string, parserContext, i);
      if (result) {
        let [token, length] = result;
        if (buffer) tokens.push(new TextToken(buffer));
        buffer = '';
        tokens.push(token);
        i += length - 1; // after this loop finishes it will increment to the next unprocessed character
        break;
      }
    }
    if (result) continue;
    buffer += characters[i];
  }

  if (buffer) tokens.push(new TextToken(buffer));

  return tokens;
}

module.exports = parseText;
