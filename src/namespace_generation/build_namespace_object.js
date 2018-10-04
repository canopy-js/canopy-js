var fs = require('fs');

function buildNamespaceObject(pathList) {
  var namespacesObject = {};

  pathList.forEach(function(path){
    var fileContents = fs.readFileSync(path, 'utf8');
    var paragraphsWithKeys = fileContents.split(/\n\n+/);
    var currentTopic = paragraphsWithKeys[0].split(':')[0];
    namespacesObject[currentTopic] = {};

    paragraphsWithKeys.forEach(function(paragraphWithKey){
      var key = paragraphWithKey.split(':')[0];
      namespacesObject[currentTopic][key] = true;
    });
  });

  return namespacesObject;
}

module.exports = buildNamespaceObject;
