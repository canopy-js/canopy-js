let recursiveReadSync = require('recursive-readdir-sync');
let fs = require('fs-extra');
let Paragraph = require('../shared/paragraph');

function paragraphsOfFile(path) {
  let fileContents = fs.readFileSync(path, 'utf8');
  return fileContents.trim().split(/\n\n+/);
}

function linesByBlockOf(string) {
  let lines = string.split(/\n/);
  let blocks = [];
  let footnoteLines = [];

  lines.forEach((line) => {
    let lastBlock = blocks[blocks.length - 1];

    if (line.match(/^\s*#/)) {
      if (lastBlock && lastBlock.type === 'code') {
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
      if (lastBlock && lastBlock.type === 'quote') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'quote',
            lines: [line]
          }
        );
      }
    } else if (line.match(/^\s*(\S+\.|[+*-])\s+\S/)) {
      if (lastBlock && lastBlock.type === 'list') {
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
      if (lastBlock && lastBlock.type === 'table') {
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
      if (lastBlock && lastBlock.type === 'html') {
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
      if (lastBlock && lastBlock.type === 'text') {
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

function topicKeyOfFile(path) {
  let paragraphsWithKeys = paragraphsOfFile(path);
  return (new Paragraph(paragraphsWithKeys[0])).key;
}

function validateImportReferenceMatching(tokens, topic, subtopic) {
  tokens.filter(t => t.type === 'import').forEach(importReferenceToken => {
    let globalToken = tokens.find(
      token => token.targetTopic === importReferenceToken.targetTopic &&
      token.targetSubtopic === importReferenceToken.targetTopic
    );

    if(!globalToken) {
      console.error(`Error: Import reference [${importReferenceToken.targetTopic}, ${importReferenceToken.targetSubtopic}] in [${topic}, ${subtopic}] lacks global reference to topic [${importReferenceToken.targetTopic}].`);
      process.exit();
    }
  });
}

function validateImportReferenceTargets(importReferencesToCheck, subtopicParents) {
  importReferencesToCheck.forEach(([enclosingTopic, enclosingSubtopic, targetTopic, targetSubtopic]) => {
    if (!hasConnection(targetSubtopic, targetTopic, subtopicParents)) {
      console.error(`Error: Import reference in [${enclosingTopic}, ${enclosingSubtopic}] is refering to unsubsumed subtopic [${targetTopic}, ${targetSubtopic}]`);
    }
  });
}

function validateRedundantLocalReferences(subtopicParents, redundantLocalReferences) {
  redundantLocalReferences.forEach(([enclosingSubtopic1, enclosingSubtopic2, topic, referencedSubtopic]) => {
    if (hasConnection(enclosingSubtopic1, topic, subtopicParents) && hasConnection(enclosingSubtopic2, topic, subtopicParents)) {
      console.error(`Error: Two local references exist in topic [${topic}] to [${referencedSubtopic}]`);
      console.error(`  One reference is in [${enclosingSubtopic1}]`);
      console.error(`  One reference is in [${enclosingSubtopic2}]`);
      console.error(`  Multiple local references to the same subtopic are not permitted.`);
      console.error(`  Consider making one of these local references a self import reference.`);
      console.error(`  (This will require explicit import syntax ie [[A#B]]).`);
      process.exit();
    }
  });
}

function hasConnection(subtopic, topic, subtopicParents) {
  if (subtopic === topic) return true;
  if (subtopicParents[topic] && !subtopicParents[topic][subtopic]) return false;
  return hasConnection(subtopicParents[topic][subtopic], topic, subtopicParents)
}

const slugFor = (string) => {
  if (!string) {return string}

  return string.replace(/ /g, '_');
}

function validateJsonFileName(filename) {
  if (filename.includes(' ')) {
    console.error(`Filename may not contain spaces: ${filename}`);
    process.exit();
  }
}

class TopicName {
  // There are several permutations of the topic key:
  // There is the "display" topic, this is the string precisely as it appears in the expl file
  // There is a "mixed case" topic, which is the displayTopic sans style characters * _ ~ ` and a trailing question mark.
  // There is an all caps topic, this is the mixed case topic but all caps, used for case-insensitive matching
  // Filenames at some point may be url encoded versions of the mixed case topic.
  constructor(string) {
    this.display = string;
    this.mixedCase = removeStyleCharacters(string).replace(/\?$/, '');
    this.slug = slugFor(this.mixedCase);
    this.caps = this.mixedCase.toUpperCase();
  }
}

/*
This function removes style characters from a string, eg '*_a_* -> 'a'
In order to remove multiple layers of wrapping, eg *_a_*, each call removes the outermost layer,
  then, if there was a difference between the previous value and this one, we try once more.
  If there was no difference, then we have run out of style tokens and can return.
*/
function removeStyleCharacters(string) {
  let newString = string.replace(/([^_`*~A-Za-z]*)([_`*~])(.*?)\2(\W+|$)/, '$1$3$4');
  if (newString !== string) {
    return removeStyleCharacters(newString);
  } else {
    return string;
  }
}

module.exports = {
  paragraphsOfFile,
  linesByBlockOf,
  consolidateTextTokens,
  topicKeyOfFile,
  listExplFilesRecursive,
  validateImportReferenceMatching,
  validateImportReferenceTargets,
  validateRedundantLocalReferences,
  validateJsonFileName,
  TopicName,
  removeStyleCharacters
};


