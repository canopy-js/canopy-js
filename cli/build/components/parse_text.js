let Matchers = require('./matchers');
let { TextToken } = require('./tokens');

function parseText({ text, parserContext }) {
  let tokens = [];
  parserContext.currentText = text;
  parserContext.currentTokens = tokens;
  parserContext.buffer = '';

  let characters = text.split('');

  for (let i = 0; i < characters.length; i++) {
    let string = characters.slice(i).join('');
    let result;

    for (let j = 0; j < Matchers.length; j++) {
      let startOfText = text[i - 1] === undefined && !parserContext.insideToken;
      let startOfLine =
        (text[i - 1] === "\n") || // really is start of new line
        (startOfText); // start of text when not parsing token within token ie start of paragraph


      result = Matchers[j]({ string, parserContext, index: i, previousCharacter: text[i - 1], startOfLine, startOfText });

      if (result) {
        let [token, length] = result;
        if (result[0]) { // escapedCharacterMatcher doesn't return a token but adds to buffer
          if (parserContext.buffer) tokens.push(new TextToken(parserContext.buffer, parserContext.preserveNewlines));
          parserContext.buffer = '';
          tokens.push(token);

          let tokenString = string.slice(0, length);
          parserContext.incrementLineAndResetCharacterNumber(tokenString.match(/\n/g)?.length || 0);
          parserContext.incrementCharacterNumber(tokenString.split('\n').slice(-1)[0].length || 0);
        }

        i += length - 1; // after this loop finishes it will increment to the next unprocessed character
        break;
      }
    }

    if (result) continue;

    parserContext.buffer += characters[i];
    parserContext.incrementCharacterNumber();
    if (characters[i] === '\n') parserContext.incrementLineAndResetCharacterNumber();
  }

  if (parserContext.buffer) tokens.push(new TextToken(parserContext.buffer, parserContext.preserveNewlines));

  return tokens;
}

module.exports = parseText;
