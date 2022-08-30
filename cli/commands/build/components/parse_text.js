let Matchers = require('./matchers');
let { TextToken } = require('./tokens');

function parseText(text, parserContext) {
  let tokens = [];
  parserContext.currentText = text;
  parserContext.currentTokens = tokens;
  parserContext.buffer = '';

  let characters = text.split('');

  for (let i = 0; i < characters.length; i++) {
    let string = characters.slice(i).join('');
    let result;
    for (let j = 0; j < Matchers.length; j++) {
      result = Matchers[j](string, parserContext, i);
      if (result) {
        let [token, length] = result;

        if (result[0]) { // escapedCharacterMatcher doesn't return a token but adds to buffer
          if (parserContext.buffer) tokens.push(new TextToken(parserContext.buffer));
          parserContext.buffer = '';
          tokens.push(token);
        }

        i += length - 1; // after this loop finishes it will increment to the next unprocessed character
        break;
      }
    }
    if (result) continue;
    parserContext.buffer += characters[i];
  }

  if (parserContext.buffer) tokens.push(new TextToken(parserContext.buffer));

  return tokens;
}

module.exports = parseText;
