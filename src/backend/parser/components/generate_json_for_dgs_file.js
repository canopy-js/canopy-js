import fs from 'fs';
import parseParagraph from './parse_paragraph';
import paragraphsOfFile from '../helpers/paragraphs_of_file';
import extractKeyAndParagraph from '../helpers/extract_key_and_paragraph';

function generateJsonForDgsFile(path, namespaceObject) {
  var paragraphsWithKeys = paragraphsOfFile(path);
  var tokenizedParagraphsByKey = {};

  paragraphsWithKeys.forEach(function(paragraphWithKey){
    var paragraphData = extractKeyAndParagraph(paragraphWithKey);
    if(!paragraphData.key){ return; }

    var currentTopic = paragraphData.key;
    var textWithoutKey = paragraphData.paragraph;

    var tokensOfParagraph = parseParagraph(textWithoutKey, namespaceObject, topicOfFile);
    tokenizedParagraphsByKey[currentTopic] = tokensOfParagraph;
  });

  return JSON.stringify(
    tokenizedParagraphsByKey,
    null,
    process.env.CANOPY_DEBUG ? 1 : 0
    );
}

export default generateJsonForDgsFile;
