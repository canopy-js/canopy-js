let Matchers = require('./matchers');
let { TextToken } = require('./tokens');
let { validateImportReferenceMatching, removeLengthKeys } = require('./helpers');

function parseText(text, parsingContext) {
  let topicReferences = Array.from(text.matchAll(/\[\[([^|\]]+)(?!\|([^\]]+))\]\]/g)).map(match => match[1]);
  parsingContext.topicReferences = topicReferences;

  let units = text.split('');
  let tokens = [];
  let buffer = '';
  for (let i = 0; i < units.length; i++) {
    let string = units.slice(i).join('');
    for (let j = 0; j < Matchers.length; j++) {
      let token = Matchers[j](string, parsingContext);
      if (token) {
        tokens.push(new TextToken(buffer));
        buffer = '';
        tokens.push(token);
        i += token.length;
        break;
      }
    }
    buffer += units[i];
  }

  tokens.push(new TextToken(buffer));
  validateImportReferenceMatching(tokens, parsingContext.currentTopic, parsingContext.currentSubtopic);
  removeLengthKeys(tokens);
  return tokens;
}

module.exports = parseText;
