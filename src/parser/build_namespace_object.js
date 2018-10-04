var paragraphsOfFile = require('../helpers/paragraphs_of_file.js');

function buildNamespaceObject(pathList) {
  var namespacesObject = {};

  pathList.forEach(function(path){
    var paragraphsWithKeys = paragraphsOfFile(path);
    var currentTopic = paragraphsWithKeys[0].split(':')[0];
    namespacesObject[currentTopic.toLowerCase()] = {};

    paragraphsWithKeys.forEach(function(paragraphWithKey){
      var key = paragraphWithKey.split(':')[0];
      namespacesObject[currentTopic.toLowerCase()][key.toLowerCase()] = true;
    });
  });

  return namespacesObject;
}

module.exports = buildNamespaceObject;
