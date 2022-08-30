let recursiveReadSync = require('recursive-readdir-sync');
let fs = require('fs-extra');
let Paragraph = require('../../shared/paragraph');
let { TextToken } = require('./tokens');

function consolidateTextTokens(tokenArray) {
  for (let i = 0; i < tokenArray.length; i++) {
    if (tokenArray[i].type === 'text' && tokenArray[i+1]?.type === 'text') {
      tokenArray.splice(i, 2, new TextToken(tokenArray[i].text + tokenArray[i+1].text));
      i = 0;
    }
  }
  return tokenArray;
}

function listExplFilesRecursive(rootDirectory) {
  let filePaths = recursiveReadSync(rootDirectory);

  filePaths = filePaths.filter(function(path){
    return path.endsWith('.expl');
  });

  return filePaths;
}

function topicKeyOfString(string) {
  let paragraphsWithKeys = string.trim().split(/\n\n+/);
  return (new Paragraph(paragraphsWithKeys[0])).key;
}

/*

When a link could be an import reference from one of two global references, we want to assign
it to the closest candidate link. LinkProximityCalculator takes a string with links, and returns
and object that can be used to retreive for a given link by index, a sorted list of other links
by proximity to that link.

*/
class LinkProximityCalculator {
  constructor(text) {
    this.links = Array.from(
      text.matchAll(/\[\[((?:.(?!\]\]))*.)\]\]/g) // [[ followed by any number of not ]], followed by ]]
    ).map(match => ({
      start: match.index,
      end: match.index + match[0].length,
      value: match[1]
    }));

    this.linksByIndex = this.links.reduce((linksByIndex, linkData) => {
      linksByIndex[linkData.start] = linkData;
      return linksByIndex;
    }, {});
  }

  linksByProximity(linkIndex) {
    let givenLinkData = this.linksByIndex[linkIndex];

    function distance(linkData1, linkData2) {
      if (linkData1.start < linkData2.start) {
        return linkData2.start - linkData1.end;
      } else {
        return linkData1.start - linkData2.end;
      }
    }

    function leastDistance(linkData1, linkData2) {
      let distanceToLink1 = distance(givenLinkData, linkData1);
      let distanceToLink2 = distance(givenLinkData, linkData2);

      if (distanceToLink1 > distanceToLink2) {
        return 1;
      } else {
        return -1;
      }
    }

    return this
      .links
      .filter(link => link.start !== linkIndex)
      .sort(leastDistance)
      .map(l => l.value);
  }
}

function updateFilesystem(directoriesToEnsure, filesToWrite, destinationDataDirectory) {
  fs.rmSync(destinationDataDirectory, { force: true, recursive: true });

  directoriesToEnsure.forEach(directoryPath => {
    fs.ensureDirSync(directoryPath);
  });

  Object.keys(filesToWrite).forEach(filePath => {
    fs.writeFileSync(filePath, filesToWrite[filePath]);
  });
}

function getExplFileData(topicsPath) {
  let explFilePaths = listExplFilesRecursive(topicsPath);
  return explFilePaths.reduce((fileData, filePath) => {
    fileData[filePath] = fs.readFileSync(filePath, 'utf8');
    return fileData;
  }, {});
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

module.exports = {
  consolidateTextTokens,
  topicKeyOfString,
  listExplFilesRecursive,
  updateFilesystem,
  getExplFileData,
  LinkProximityCalculator,
  removeCircularListKeys
};
