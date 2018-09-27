var recursiveReadSync = require('recursive-readdir-sync');
var fs = require('fs');

function buildNamespaceObject(topicsPath) {
  var topicNamespacesObject = {};
  var topicFilePathStrings = recursiveReadSync(topicsPath);

  topicFilePathStrings = topicFilePathStrings.filter(function(path){
    return path.endsWith('.dgs');
  });

  topicFilePathStrings.forEach(function(topicFilePathString){
    var topicFileContents = fs.readFileSync(topicFilePathString, 'utf8');
    var paragraphsWithKeys = topicFileContents.split(/\n\n+/);
    var currentTopic = paragraphsWithKeys[0].split(':')[0];
    topicNamespacesObject[currentTopic] = {};

    paragraphsWithKeys.forEach(function(paragraphWithKey){
      var key = paragraphWithKey.split(':')[0];
      topicNamespacesObject[currentTopic][key] = true;
    });
  });

  return topicNamespacesObject;
}

module.exports = buildNamespaceObject;
