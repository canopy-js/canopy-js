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
          if (parserContext.buffer) tokens.push(new TextToken(parserContext.buffer));
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

    let textSpan = string.match(/^(?:(?!\S\S\S\S?\S?\S?:\/\/)(?!(?:^|\s)(?:..?.?\.|- ))(?!\s- )[A-Za-z0-9,?'":;%$#@()/\s])+/)?.[0];
    let initialPlaintext = textSpan || characters[i]; // obvious plaintext or special character that is really plaintext
    parserContext.buffer += initialPlaintext;
    i += initialPlaintext.length - 1; // will get incremented
    parserContext.incrementLineAndResetCharacterNumber(initialPlaintext.match(/\n/g)?.length || 0);
    parserContext.incrementCharacterNumber(initialPlaintext.split('\n').slice(-1)[0].length || 0);

  }

  if (parserContext.buffer) tokens.push(new TextToken(parserContext.buffer));

  return tokens;
}

module.exports = parseText;
