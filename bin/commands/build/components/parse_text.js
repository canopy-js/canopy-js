let Matchers = require('./matchers');
let { TextToken } = require('./tokens');
let { validateImportReferenceMatching, removeLengthKeys } = require('./helpers');

function parseText(text, parsingContext) {
  let topicReferences = Array.from(text.matchAll(/\[\[([^|\]]+)(?!\|([^\]]+))\]\]/g)).map(match => match[1]);
  parsingContext.topicReferences = topicReferences;

  let characters = text.split('');
  let tokens = [];
  let buffer = '';
  for (let i = 0; i < characters.length; i++) {
    let string = characters.slice(i).join('');
    for (let j = 0; j < Matchers.length; j++) {
      let result = Matchers[j](string, parsingContext);
      if (result) {
        let [token, length] = result;
        tokens.push(new TextToken(buffer));
        buffer = '';
        tokens.push(token);
        i += length;
        break;
      }
    }

    buffer += characters[i];
  }

  tokens.push(new TextToken(buffer));
  validateImportReferenceMatching(tokens, parsingContext.currentTopic, parsingContext.currentSubtopic);
  return tokens;
}

module.exports = parseText;
