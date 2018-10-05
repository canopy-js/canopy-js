var unitsOf = require('./units_of.js');

function parseClause(clauseWithPunctuation, namespaceObject, currentTopic, importedNamespaces) {
  var tokens = [];
  var units = unitsOf(clauseWithPunctuation);
  var globalNamespace = namespaceObject;

  // Find greatest suffix-prefix match
  // TODO: understand why the opposite doesn't work
  while (units.length > 0) {
    for(var i = units.length - 1; i >= 0; i--) {
      if (units[0] === ' ') { break; }
      if (units[i] === ' ') { continue; }
      if (i === 0) { continue; }

      var substring = units.slice(0, i + 1).join('').toLowerCase();

      if (globalNamespace.hasOwnProperty(substring)) {
        var token = new GlobalReferenceToken(substring);
        tokens.push(token);
        importedNamespaces.push(substring);
        units = units.slice(i, units.length);
        break;
      }

      var avaliableNamespaces = Array.prototype.concat(
        importedNamespaces, currentTopic.toLowerCase()
        );

      var breakFlag = false;
      for(var j = 0; j < avaliableNamespaces.length; j++){
        // TODO: see if you can do this without side effects
        var namespaceName = avaliableNamespaces[j];
        var currentNamespace = namespaceObject[namespaceName];
        // TODO: differentiate between local and imported references by type
        if (currentNamespace.hasOwnProperty(substring)) {
          var token = new LocalReferenceToken(substring, namespaceName);
          tokens.push(token);
          units = units.slice(i + 1, units.length);
          breakFlag = true;
        }
      }
      if(breakFlag){break;}
    }

    // TODO: rewrite this to add text tokens to an open buffer
    // that gets cleared when a reference token is created
    var firstUnit = units.slice(0, 1);
    var token = new TextToken(firstUnit);
    tokens.push(token);
    units = units.slice(1);
  }

  return tokens
}

function TextToken(text) {
  this.text = text;
  this.type = 'text';
}

function LocalReferenceToken(text, contextName) {
  this.text = text;
  this.context = contextName;
  this.type = 'local';
}

function GlobalReferenceToken(text) {
  this.text = text;
  this.type = 'global';
}

module.exports = parseClause;
