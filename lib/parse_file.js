var fs = require('fs');
var parseParagraph = require('./parse_paragraph');

function parseFile(topicFilePathString, namespaceObject) {
  var topicFileContents = fs.readFileSync(topicFilePathString, 'utf8');
  var tokenizedParagraphsByKey = {};
  var paragraphsWithKeys = topicFileContents.split(/\n\n+/);

  paragraphsWithKeys.forEach(function(paragraphWithKey){
    var match = paragraphWithKey.match(/([^:]+):\s*(.*)/);
    var key = match[1];
    var textWithoutKey = match[2];

    var tokensOfParagraph = parseParagraph(textWithoutKey, namespaceObject);
    tokenizedParagraphsByKey[key] = tokensOfParagraph;
  });

  return tokenizedParagraphsByKey;
}

module.exports = parseFile;
