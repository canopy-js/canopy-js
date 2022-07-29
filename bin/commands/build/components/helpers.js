let recursiveReadSync = require('recursive-readdir-sync');
let fs = require('fs-extra');
let Paragraph = require('../../shared/paragraph');
let dedent = require('dedent-js');
let Topic = require('../../shared/topic');

function linesByBlockOf(string) {
  let lines = string.split(/\n/);
  let blocks = [];
  let footnoteLines = [];

  lines.forEach((line) => {
    let lastBlock = blocks[blocks.length - 1];

    if (line.match(/^\s*#/)) {
      if (lastBlock?.type === 'code') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'code',
            lines: [line]
          }
        );
      }
    } else if (line.match(/^\s*>/)) {
      if (lastBlock?.type === 'quote') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'quote',
            lines: [line]
          }
        );
      }
    } else if (line.match(/^\s*([A-Za-z0-9+*-]{1,3}\.|[+*-])\s+\S+/)) {
      if (lastBlock?.type === 'list') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'list',
            lines: [line]
          }
        );
      }
    } else if (line.match(/^\|([^|\n]*\|)+/)) {
      if (lastBlock?.type === 'table') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'table',
            lines: [line]
          }
        );
      }
    } else if (line.match(/^\s*\[\^[^\]]+]\:/)) {
      footnoteLines.push(line);
    } else if (line.match(/\<.*\>/)) {
      if (lastBlock?.type === 'html') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'html',
            lines: [line]
          }
        );
      }
    } else {
      if (lastBlock?.type === 'text') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'text',
            lines: [line]
          }
        );
      }
    }
  });

  if (footnoteLines.length > 0) {
    blocks.push(
      {
        type: 'footnote',
        lines: footnoteLines
      }
    );
  }

  return blocks;
}

function consolidateTextTokens(tokenArray) {
  if (tokenArray.length === 0) { return []; }

  let nextToken;
  let numberOfTokensProcessed;

  if (tokenArray[0].type !== 'text') {
    nextToken = tokenArray[0];
    numberOfTokensProcessed = 1;
  } else {
    let indexAfterLastTextToken = tokenArray.findIndex((item) => item.type !== 'text');
    numberOfTokensProcessed = indexAfterLastTextToken > -1 ? indexAfterLastTextToken : tokenArray.length;

    nextToken = new TextToken(
      tokenArray.slice(0, numberOfTokensProcessed).map((token) => token.text).join('')
    )
  }

  return flat([
    nextToken,
    consolidateTextTokens(
      tokenArray.slice(numberOfTokensProcessed)
    )
  ]);
}

function unitsOf(string) {
  if (!string) return [];

  return string.split(/\b|(?=\W)/);
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
      }))

    this.linksByIndex = this.links.reduce((linksByIndex, linkData) => {
      linksByIndex[linkData.start] = linkData;
      return linksByIndex
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

module.exports = {
  linesByBlockOf,
  consolidateTextTokens,
  topicKeyOfString,
  listExplFilesRecursive,
  updateFilesystem,
  getExplFileData,
  LinkProximityCalculator
};
