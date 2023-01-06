let Matchers = require('./matchers');
let { TextToken } = require('./tokens');

function parseText({ text, parserContext, preserveNewlines, recursive }) {
  let tokens = [];
  parserContext.currentText = text;
  parserContext.currentTokens = tokens;
  parserContext.buffer = '';
  parserContext.recursive = recursive;
  parserContext.preserveNewlines = preserveNewlines || false;

  let characters = text.split('');

  for (let i = 0; i < characters.length; i++) {
    let string = characters.slice(i).join('');
    let result;
    for (let j = 0; j < Matchers.length; j++) {
      let startOfLine = text[i - 1] === "\n" || (text[i - 1] === undefined && !recursive); // start of line or text when not parsing token within token
      result = Matchers[j]({ string, parserContext, index: i, previousCharacter: text[i - 1], startOfLine });
      if (result) {
        let [token, length] = result;
        if (result[0]) { // escapedCharacterMatcher doesn't return a token but adds to buffer
          if (parserContext.buffer) tokens.push(new TextToken(parserContext.buffer, parserContext.preserveNewlines));
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

  if (parserContext.buffer) tokens.push(new TextToken(parserContext.buffer, parserContext.preserveNewlines));

  return tokens;
}

module.exports = parseText;
