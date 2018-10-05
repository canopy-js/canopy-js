var fs = require('fs');
var parseParagraph = require('./parse_paragraph');
var paragraphsOfFile = require('../helpers/paragraphs_of_file');

function generateJsonForDgsFile(path, namespaceObject) {
  var paragraphsWithKeys = paragraphsOfFile(path);
  var tokenizedParagraphsByKey = {};
  var topicOfFile = paragraphsWithKeys[0].split(':')[0];

  paragraphsWithKeys.forEach(function(paragraphWithKey){
    var match = paragraphWithKey.match(/([^:.,;]+):\s*(.*)/);
    if(!match){ return; }

    var currentTopic = match[1];
    var textWithoutKey = match[2];

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
