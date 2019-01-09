import flat from 'array.prototype.flat';

function TextToken(text, units) {
  this.text = text;
  this.type = 'text';
  this.units = units;
}

function LocalReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text,
    units
  ) {
  this.type = 'local';
  this.text = text;
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.units = units;
}

function GlobalReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text,
    units
  ) {
  this.type = 'global';
  this.targetTopic = targetTopic;
  this.targetSubtopic = targetSubtopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.text = text;
  this.length;
  this.units = units;
}

function consolidateTextTokens(tokenArray) {
  let newArray = [];

  for (let i = 0; i < tokenArray.length; i++) {
    let startToken = tokenArray[i];

    // If the current token is the last token, take it
    if (i === tokenArray.length - 1) {
      newArray.push(startToken);
      break;
    }

    // If the current token is not a text token, take it
    if (startToken.type !== 'text') {
      newArray.push(startToken);
      continue;
    }

    // If the current token is a text token and the next one is not, take it
    if (tokenArray[i + 1].type !== 'text') {
      newArray.push(startToken);
      break;
    }

    // If the current token is a text token and the next one is also,
    // look ahead until a non-text token or end-of-array is found,
    // then merge all consecutive text tokens into one.
    for (let j = i + 1; j < tokenArray.length; j++) {
      let tokenAfterEndOfSpan = tokenArray[j + 1];

      if (!tokenAfterEndOfSpan || tokenAfterEndOfSpan.type !== 'text') {
        newArray.push(
          new TextToken(
            tokenArray.slice(i, j + 1).map((token) => token.text).join(''),
            flat(tokenArray.slice(i, j + 1).map((token) => token.units))
          )
        );

        i = j;
        break;
      }
    }
  }

  return newArray;
}

export {
  LocalReferenceToken,
  GlobalReferenceToken,
  TextToken,
  consolidateTextTokens
};
