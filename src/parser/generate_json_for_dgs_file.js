var fs = require('fs');

function generateJsonForDgsFile(path) {
  var contents = fs.readFileSync(path, 'utf8');
  return contents;
}

module.exports = generateJsonForDgsFile;
