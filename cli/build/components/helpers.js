let recursiveReadSync = require('recursive-readdir-sync');
let fs = require('fs-extra');
let Paragraph = require('../../shared/paragraph');
let Topic = require('../../shared/topic');
let { TextToken } = require('./tokens');
let chalk = require('chalk');

function consolidateTextTokens(tokenArray) {
  for (let i = 0; i < tokenArray.length; i++) {
    if (tokenArray[i].type === 'text' && tokenArray[i+1]?.type === 'text') {
      tokenArray.splice(i, 2, new TextToken(tokenArray[i].text + tokenArray[i+1].text, true));
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

function updateFilesystem(directoriesToEnsure, filesToWrite, options) {
  directoriesToEnsure.forEach(directoryPath => {
    fs.ensureDirSync(directoryPath);
    if (options.logging) console.log(chalk.yellow('Created directory: ' + directoryPath));
  });

  Object.keys(filesToWrite).forEach(filePath => {
    fs.writeFileSync(filePath, filesToWrite[filePath]);
    if (options.logging) console.log(chalk.yellow("Writing to: " + filePath));
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
  return filePath.match(/([^\/]+)\/(\1).expl$/);
}

function terminalCategoryofPath(filePath) {
  let items = filePath.split('/');
  return items[items.length - 2];
}

function parseLink(string) {
  let displayText = '';
  let keyText = '';
  let linkMatch = string.match(/^\[\[((?:(?!(?<!\\)\]\]).)+)\]\]/);
  if (!linkMatch) return {};
  let linkContents = linkMatch[1];
  let numberOfUnescapedPipes = linkContents.match(/(?<!\\)\|/g)?.length || 0;
  let fullText = linkMatch[0];

  if (numberOfUnescapedPipes === 2) { // eg [[A |B| C]], selecting B as display, eg see [[|the answer| to question x]]
    let segments = linkContents.split(/(?<!\\)\|/g);
    keyText = segments.join('');
    displayText = segments[1];
  } else if (numberOfUnescapedPipes > 2) { // eg [[the |US ||treasury]] ie shared|key|display|shared
    linkContents.split(/(?<!\\)\|/g).forEach((substring, index) => {
      if (index % 3 === 0) (keyText += substring) && (displayText += substring);
      if (index % 3 === 1) keyText += substring;
      if (index % 3 === 2) displayText += substring;
    });
  } else if (numberOfUnescapedPipes === 1) {
    let segments = linkContents.split(/(?<!\\)\|/g);
    keyText = segments[0];
    displayText = segments[1];
  } else {
    keyText = linkContents;
  }

  // Match [[a]] or [[a#b]] or [[a|b]] or [[a#b|c]] or [[number\#3#number\#4]]
  let match = keyText.match(/^((?:(?!(?<!\\)[\]#|]).)+)(?:#((?:(?!(?<!\\)[\]#|]).)+))?(?:\|((?:(?!(?<!\\)[\]#|]).)+))?/);

  return {
    linkTarget: match && match[1] || null, // eg "France"
    linkFragment: match && match[2] || null, // eg "Paris"
    linkText: displayText || (match && (match[3] || match[2] || match[1] || null)), // The specified link text, defaulting to subtopic
    fullText
  };
}

function determineTopicAndSubtopic(linkTarget, linkFragment) {
  let targetTopic, targetSubtopic;
  if (linkFragment) {
    targetTopic = new Topic(linkTarget);
    targetSubtopic = new Topic(linkFragment);
  } else {
    targetTopic = null;
    targetSubtopic = new Topic(linkTarget);
  }

  return {
    targetTopic,
    targetSubtopic
  };
}

module.exports = {
  consolidateTextTokens,
  topicKeyOfString,
  listExplFilesRecursive,
  updateFilesystem,
  getExplFileData,
  LinkProximityCalculator,
  removeCircularListKeys,
  frontLoadImages,
  isCategoryNotesFile,
  terminalCategoryofPath,
  parseLink,
  determineTopicAndSubtopic
};
