var fs = require('fs');
var parseParagraph = require('./parse_paragraph');
var paragraphsOfFile = require('../helpers/paragraphs_of_file');
var extractKeyAndParagraph = require('../helpers/extract_key_and_paragraph');

function generateJsonForDgsFile(path, namespaceObject) {
  var paragraphsWithKeys = paragraphsOfFile(path);
  var tokenizedParagraphsByKey = {};
  var topicOfFile = paragraphsWithKeys[0].split(':')[0];

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

module.exports = generateJsonForDgsFile;
