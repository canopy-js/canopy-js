let recursiveReadSync = require('recursive-readdir-sync');
let fs = require('fs-extra');
let { Paragraph } = require('../../shared');
let dedent = require('dedent-js');
let { TopicName } = require('../../shared');

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

function validateImportReferenceGlobalMatching(tokens, enclosingTopic, enclosingSubtopic, topicSubtopics) {
  tokens.filter(t => t.type === 'import').forEach(importReferenceToken => {
    let globalToken = tokens.find(
      token => token.targetTopic === importReferenceToken.targetTopic &&
      token.targetSubtopic === importReferenceToken.targetTopic
    );

    if(!globalToken) {
      let targetTopicName = new TopicName(importReferenceToken.targetTopic);
      let targetSubtopicName = new TopicName(importReferenceToken.targetSubtopic);
      let targetTopic = topicSubtopics[targetTopicName.caps, targetTopicName.caps];
      let targetSubtopic = topicSubtopics[targetTopicName.caps, targetSubtopicName.caps];

      throw `Error: Import reference to [${targetTopicName.mixedCase}, ${targetSubtopicName.mixedCase}] in [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] lacks global reference to topic [${targetTopicName.mixedCase}].`;
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

function validateSubtopicDefinitions(doubleDefinedSubtopics, subtopicParents) {
  doubleDefinedSubtopics.forEach(([topic, subtopic]) => {
    if (subtopicParents[topic.caps]?.hasOwnProperty(subtopic.caps)) {
      throw `Error: Subtopic [${subtopic.mixedCase}] or similar appears twice in topic: [${topic.mixedCase}]`;
    }
  });
}

function validateRedundantLocalReferences(subtopicParents, redundantLocalReferences) { // can only be done after we've seen every local reference
  redundantLocalReferences.forEach(([enclosingSubtopic1, enclosingSubtopic2, topic, referencedSubtopic]) => { // are problematic links in real subsumed paragraphs?
    if (hasConnection(enclosingSubtopic1, topic, subtopicParents) && hasConnection(enclosingSubtopic2, topic, subtopicParents)) {
      throw dedent`Error: Two local references exist in topic [${topic.mixedCase}] to subtopic [${referencedSubtopic.mixedCase}]

          - One reference is in [${topic.mixedCase}, ${enclosingSubtopic1.mixedCase}]
          - One reference is in [${topic.mixedCase}, ${enclosingSubtopic2.mixedCase}]

          Multiple local references to the same subtopic are not permitted.
          Consider making one of these local references a self-import reference.
          That would look like using [[${topic.mixedCase}#${referencedSubtopic.mixedCase}]] in the same paragraph as
          a reference to [[${topic.mixedCase}]].

          (It is also possible you meant one of these as an import reference, however,
          if both links could be either local or import references, you must clarify
          which is the import reference using explicit import syntax ie [[Other Topic#${referencedSubtopic.mixedCase}]])
          `;
    }
  });
}

function hasConnection(subtopic, topic, subtopicParents) {
  if (subtopic.caps === topic.caps) return true;
  if (subtopicParents[topic.caps] && !subtopicParents[topic.caps][subtopic.caps]) return false;
  if (!subtopicParents.hasOwnProperty(topic.caps)) return false; // there were no local references in that topic
  if (!subtopicParents[topic.caps].hasOwnProperty(subtopic.caps)) return false; // no one ever referenced the subtopic
  return hasConnection(subtopicParents[topic.caps][subtopic.caps], topic, subtopicParents)
}

/*

When a link could be an import reference from one of two global references, we want to assign
it to the closest candidate link. linkProximityCalculator takes a string with links, and returns
and object that can be used to retreive for a given link by index, a sorted list of other links
by proximity to that link.

*/
class linkProximityCalculator {
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
  validateImportReferenceGlobalMatching,
  validateImportReferenceTargets,
  validateRedundantLocalReferences,
  validateSubtopicDefinitions,
  linkProximityCalculator,
  updateFilesystem,
  getExplFileData
};
