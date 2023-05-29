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

function parseLink(string, parserContext) {
  let linkMatch = string.match(/^\[\[((?:(?!(?<!\\)(?:\]\]|\[\[)).)+)\]\]/s);
  if (!linkMatch) return {};
  let linkContents = linkMatch[1];
  let [displayText, targetText, exclusiveDisplayText, exclusiveTargetText] = ['','','',''];
  let linkFullText = linkMatch[0];
  let manualDisplayText = false; // did the user set the display text, or is it inferred from the targetText?
  let exclusiveTargetSyntax = false;
  let exclusiveDisplaySyntax = false;

  if (linkContents.match(/(?<!\\)\{/)) {
    let segments = Array.from(linkContents.matchAll(/((?<!\\)\{\{?)((?:(?!(?<!\\)\}).)+)((?<!\\)\}\}?)|((?:(?!(?<!\\)[{}]).)+)/gs));
    segments.forEach(([_, openingBraces, braceContents, closingBraces, plainText]) => {
      if (plainText) { // a section of regular text in a link eg [[ABC...
        displayText += plainText;
        targetText += plainText;
      } else {
        if (openingBraces.length !== closingBraces.length) throw new Error(chalk.red(`Link has unbalanced curly braces: ${linkFullText}\n${parserContext.filePathAndLineNumber}`));
        manualDisplayText = true;

        if (openingBraces.length === 1) { // eg [[{ ... }]]
          let pipeSegments = braceContents.split(/(?<!\\)\|/);
          if (pipeSegments && pipeSegments.length === 2) { // this is a link text segment such as {A|B}, where A is added to the target text and B is added to the display text
            targetText += pipeSegments[0];
            displayText += pipeSegments[1];
            exclusiveTargetText += pipeSegments[0]; // if we later see an exclusive syntax, retroactively we will have added interpolations to it
            exclusiveDisplayText += pipeSegments[1];
          } else { // this is a link text segment such as {A}, which exclusively selects A as the display text
            exclusiveDisplaySyntax = true;
            exclusiveDisplayText += braceContents;
            targetText += braceContents;
          }
        }

        if (openingBraces.length === 2) { // for a link like {{A}} which exclusively selects A as the target text
          exclusiveTargetSyntax = true;
          exclusiveTargetText += braceContents;
          displayText += braceContents;
        }
      }
    });

    displayText = exclusiveDisplaySyntax ? exclusiveDisplayText : displayText;
    targetText = exclusiveTargetSyntax ? exclusiveTargetText : targetText;
  } else if (linkContents.match(/(?<!\\)\|/)) { // eg [[A|B]]
    let segments = linkContents.split(/(?<!\\)\|/);
    targetText = segments[0];
    displayText = segments[1];
    manualDisplayText = true;
  } else { // regular link eg [[London]] or [[England#London]]
    targetText = linkContents;
  }

  let match = targetText.match(/^((?:(?!(?<!\\)#).)+)(?:#((?:(?!(?<!\\)#).)+))?$/s); // Match [[a]] or [[a#b]] or [[number\#3#number\#4]]

  return {
    linkTarget: (match && match[1])?.replace(/\n/g, ' ') || null, // eg "France"
    linkFragment: (match && match[2])?.replace(/\n/g, ' ') || null, // eg "Paris"
    linkText: manualDisplayText ? displayText : (match && (match[2] || match[1] || null)), // The specified link text, defaulting to subtopic
    linkFullText,
    manualDisplayText
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
  removeCircularListKeys,
  frontLoadImages,
  isCategoryNotesFile,
  terminalCategoryofPath,
  parseLink,
  determineTopicAndSubtopic
};
