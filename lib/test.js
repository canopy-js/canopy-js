var buildNamespaceObject = require('./build_namespace_object.js');
var parseFile = require('./parse_file');

namespaceObject = buildNamespaceObject('/Users/Allen/cheshbonot/topics');
console.log(namespaceObject);

var tokens = parseFile('/Users/Allen/cheshbonot/topics/halacha.dgs', namespaceObject);
console.log(tokens);
