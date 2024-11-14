let Block = require('../../shared/block');
let { TextToken } = require('./tokens');

function consolidateTextTokens(tokenArray) {
  for (let i = 0; i < tokenArray.length; i++) {
    if (tokenArray[i].type === 'text' && tokenArray[i+1]?.type === 'text') {
      tokenArray.splice(i, 2, new TextToken(tokenArray[i].text + tokenArray[i+1].text, true));
      i = 0;
    }
  }
  return tokenArray;
}

function topicKeyOfString(string) {
  let paragraphsWithKeys = string.trim().split(/\n\n+/);
  return (new Block(paragraphsWithKeys[0])).key;
}

function removeCircularListKeys(tokens) {
  tokens.filter(token => token.type === 'list').forEach(token => {
    delete token.lastNode;
    token.topLevelNodes.forEach(node => removeExtraKeys(node));
  });
}

function removeExtraKeys(node) {
  delete node.parentNode;
  delete node.indentation;
  node.children.forEach(removeExtraKeys);
}

function frontLoadImages(tokens) {
  tokens.sort((a,b) => {
    if (a.type === 'image' & b.type !== 'image') {
      return -1;
    } else if (a.type !== 'image' & b.type === 'image') {
      return 1;
    } else {
      return 0;
    }
  });
}

function isCategoryNotesFile(filePath) {
  return filePath.match(/([^/]+)\/(\1).expl$/);
}

function terminalCategoryofPath(filePath) {
  let items = filePath.split('/');
  return items[items.length - 2];
}


module.exports = {
  consolidateTextTokens,
  topicKeyOfString,
  removeCircularListKeys,
  removeExtraKeys,
  frontLoadImages,
  isCategoryNotesFile,
  terminalCategoryofPath
};
