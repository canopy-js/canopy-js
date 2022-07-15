let recursiveReadSync = require('recursive-readdir-sync');
let fs = require('fs-extra');
let { Paragraph } = require('../../shared');

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

function topicKeyOfFile(path) {
  let paragraphsWithKeys = paragraphsOfFile(path);
  return (new Paragraph(paragraphsWithKeys[0])).key;
}

function validateImportReferenceGlobalMatching(tokens, enclosingTopic, enclosingSubtopic, topicSubtopics) {
  tokens.filter(t => t.type === 'import').forEach(importReferenceToken => {
    let globalToken = tokens.find(
      token => token.targetTopic === importReferenceToken.targetTopic &&
      token.targetSubtopic === importReferenceToken.targetTopic
    );

    if(!globalToken) {
      let targetTopic = topicSubtopics[importReferenceToken.targetTopic, importReferenceToken.targetTopic];
      let targetSubtopic = topicSubtopics[importReferenceToken.targetTopic, importReferenceToken.targetSubtopic];
      let enclosingTopic = topicSubtopics[enclosingTopic][enclosingTopic];
      let enclosingSubtopic = topicSubtopics[enclosingTopic][enclosingSubtopic];

      throw `Error: Import reference to [${targetTopic.mixedCase}, ${targetSubtopic.mixedCase}] in [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] lacks global reference to topic [${targetTopic.mixedCase}].`;
    }
  });
}

function validateImportReferenceTargets(importReferencesToCheck, subtopicParents) {
  importReferencesToCheck.forEach(([enclosingTopic, enclosingSubtopic, targetTopic, targetSubtopic]) => {
    if (!hasConnection(targetSubtopic, targetTopic, subtopicParents)) {
      throw `Error: Import reference in [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] is refering to unsubsumed subtopic [${targetTopic.mixedCase}, ${targetSubtopic.mixedCase}]`;
    }
  });
}

function validateRedundantLocalReferences(subtopicParents, redundantLocalReferences) {
  redundantLocalReferences.forEach(([enclosingSubtopic1, enclosingSubtopic2, topic, referencedSubtopic]) => {
    if (hasConnection(enclosingSubtopic1, topic, subtopicParents) && hasConnection(enclosingSubtopic2, topic, subtopicParents)) {
      throw `Error: Two local references exist in topic [${topic}] to [${referencedSubtopic}]\n` +
      `  One reference is in [${enclosingSubtopic1}]\n` +
      `  One reference is in [${enclosingSubtopic2}]\n` +
      `  Multiple local references to the same subtopic are not permitted.\n` +
      `  Consider making one of these local references a self import reference.\n` +
      `  That would look like either [[${enclosingSubtopic1}#${referencedSubtopic}]] or [[${enclosingSubtopic2}#${referencedSubtopic}]].\n`;
    }
  });
}

function hasConnection(subtopic, topic, subtopicParents) {
  if (subtopic.caps === topic.caps) return true;
  if (subtopicParents[topic.caps] && !subtopicParents[topic.caps][subtopic.caps]) return false;
  return hasConnection(subtopicParents[topic.caps][subtopic.caps], topic.caps, subtopicParents)
}

module.exports = {
  paragraphsOfFile,
  linesByBlockOf,
  consolidateTextTokens,
  topicKeyOfFile,
  listExplFilesRecursive,
  validateImportReferenceGlobalMatching,
  validateImportReferenceTargets,
  validateRedundantLocalReferences
};
