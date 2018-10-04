var fs = require('fs');

function paragraphsOfFile(path) {
  var fileContents = fs.readFileSync(path, 'utf8');
  return fileContents.trim().split(/\n\n+/);
}

module.exports = paragraphsOfFile;
