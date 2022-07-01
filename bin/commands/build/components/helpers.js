let recursiveReadSync = require('recursive-readdir-sync');
let fs = require('fs-extra');

function subsumingPathExists(topic1, topic2, localReferenceGraph, stack=[]) {
  if (topic1 === topic2) {
    return true;
  } else if (!localReferenceGraph.hasOwnProperty(topic1)) {
    return false;
  } else if (localReferenceGraph[topic1].includes(topic2)) {
    return true;
  } else if (stack.includes(topic1)) {
    return false // reject cycles
  } else {
    stack.push(topic1);
    return localReferenceGraph[topic1].some(
      (referencedSubtopic) => subsumingPathExists(
        referencedSubtopic,
        topic2,
        localReferenceGraph,
        stack
      )
    )
  }
}

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


function extractKeyAndParagraph(paragraphWithKey) {
  let match = paragraphWithKey.match(/^(?!-)([^:.,;]+):\s+/);

  if (!match) {
    return {
      key: null,
      paragraph: paragraphWithKey
    }
  }

  let key = match[1];
  let paragraphWithoutKey = paragraphWithKey.slice(match[0].length);

  return {
    key: key,
    paragraph: paragraphWithoutKey
  };
}

function topicKeyOfFile(path) {
  let paragraphsWithKeys = paragraphsOfFile(path);
  return extractKeyAndParagraph(paragraphsWithKeys[0]).key;
}

function removeMarkdownTokens(string) {
  if (!string) return string;
  return string.
    replace(/([^\\]|^)_/g, '$1').
    replace(/([^\\]|^)\*/g, '$1').
    replace(/([^\\]|^)`/g, '$1').
    replace(/([^\\]|^)~/g, '$1');
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
    if (!hasConnection(targetSubtopic, targetTopic)) {
      console.error(`Error: Import reference in [${enclosingTopic}, ${enclosingSubtopic}] is refering to unsubsumed subtopic [${targetTopic}, ${targetSubtopic}]`);
    }
  });

  function hasConnection(subtopic, topic) {
    if (subtopic === topic) return true;
    if (!(subtopicParents[topic] && subtopicParents[topic][subtopic])) return false;
    return hasConnection(subtopicParents[topic][subtopic], topic)
  }
}

module.exports = {
  paragraphsOfFile,
  linesByBlockOf,
  consolidateTextTokens,
  topicKeyOfFile,
  extractKeyAndParagraph,
  listExplFilesRecursive,
  subsumingPathExists,
  removeMarkdownTokens,
  validateImportReferenceMatching,
  validateImportReferenceTargets
};


