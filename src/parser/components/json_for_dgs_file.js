import fs from 'fs';
import parseBlock from './parse_block';
import paragraphsOfFile from '../helpers/paragraphs_of_file';
import extractKeyAndParagraph from '../helpers/extract_key_and_paragraph';

function jsonForDgsFile(path, namespaceObject) {
  var paragraphsWithKeys = paragraphsOfFile(path);
  var tokenizedParagraphsByKey = {};
  var topicOfFile = extractKeyAndParagraph(paragraphsWithKeys[0]).key;
  if (!topicOfFile) { return ''; }

  paragraphsWithKeys.forEach(function(paragraphWithKey){
    var paragraphData = extractKeyAndParagraph(paragraphWithKey);
    if (!paragraphData.key) { return; }

    var currentSubtopic = paragraphData.key;
    var textWithoutKey = paragraphData.block;

    var tokensOfParagraph = parseBlock(
      textWithoutKey,
      namespaceObject,
      currentSubtopic,
      topicOfFile
    );

    tokenizedParagraphsByKey[currentSubtopic] = tokensOfParagraph;
  });

  return JSON.stringify(
    tokenizedParagraphsByKey,
    null,
    process.env.CANOPY_DEBUG ? 1 : 0
    );
}

export default jsonForDgsFile;
