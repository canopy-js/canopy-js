var paragraphsOfFile = require('../helpers/paragraphs_of_file');
var extractKeyAndParagraph = require('../helpers/extract_key_and_paragraph');

function buildNamespaceObject(pathList) {
  var namespacesObject = {};

  pathList.forEach(function(path){
    var paragraphsWithKeys = paragraphsOfFile(path);
    var currentTopic = extractKeyAndParagraph(paragraphsWithKeys[0]).key
    namespacesObject[currentTopic] = {};

    paragraphsWithKeys.forEach(function(paragraphWithKey){
      var key = paragraphWithKey.split(':')[0];
      namespacesObject[currentTopic][key] = true;
    });
  });

  return namespacesObject;
}

module.exports = buildNamespaceObject;
