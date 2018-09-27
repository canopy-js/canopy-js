var recursiveReadSync = require('recursive-readdir-sync');
var fs = require('fs');

function buildGlobalNamespace(topicsPath) {
  var globalNamespace = {};
  var topicFiles = recursiveReadSync(topicsPath);

  topicFiles = topicFiles.filter(function(path){
    return path.endsWith('.dgs');
  });

  topicFiles.forEach(function(filePath){
    globalNamespace[rootKeyOfFile(filePath)] = true;
  });

  return(globalNamespace);
}

function rootKeyOfFile(filePath) {
  var contents = fs.readFileSync(filePath, 'utf8');
  return contents.split(':')[0];
}

module.exports = buildGlobalNamespace;
