let Matchers = require('./matchers');
let { TextToken } = require('./tokens');
let { validateImportReferenceGlobalMatching, removeLengthKeys } = require('./helpers');

function parseText(text, parsingContext) {
  let { currentTopic, currentSubtopic, topicSubtopics } = parsingContext;

  let topicReferences = Array.from(text.matchAll(/\[\[([^|\]]+)(?!\|([^\]]+))\]\]/g)).map(match => match[1]);
  parsingContext.topicReferences = topicReferences;

  let characters = text.split('');
  let tokens = [];
  let buffer = '';

  for (let i = 0; i < characters.length; i++) {
    let string = characters.slice(i).join('');
    let result;
    for (let j = 0; j < Matchers.length; j++) {
      result = Matchers[j](string, parsingContext);
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

  validateImportReferenceGlobalMatching(
    tokens,
    currentTopic,
    currentSubtopic,
    topicSubtopics
  );

  return tokens;
}

module.exports = parseText;
