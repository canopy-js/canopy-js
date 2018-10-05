var unitsOf = require('./units_of.js');

function parseClause(clauseWithPunctuation, namespaceObject, currentTopic, importedNamespaces) {
  var tokens = [];
  var units = unitsOf(clauseWithPunctuation);
  var globalNamespace = namespaceObject;
  var textTokenBuffer = '';

  // Find greatest suffix-prefix match
  // TODO: understand why the opposite doesn't work
  while (units.length > 0) {
    for(var i = units.length - 1; i >= 0; i--) {
      if (units[0] === ' ') { break; }
      if (units[i] === ' ') { continue; }
      if (i === 0) { continue; }

      var substring = units.slice(0, i + 1).join('');
      var substringLowercase = substring.toLowerCase();

      if (globalNamespace.hasOwnProperty(substringLowercase)) {
        var token = new TextToken(textTokenBuffer);
        tokens.push(token);
        textTokenBuffer = '';

        var token = new GlobalReferenceToken(substringLowercase);
        tokens.push(token);
        importedNamespaces.push(substringLowercase);
        units = units.slice(i + 1, units.length);
        continue;
      }

      var avaliableNamespaces = Array.prototype.concat(
        importedNamespaces, currentTopic.toLowerCase()
        );

      var continueFlag = false;
      for(var j = 0; j < avaliableNamespaces.length; j++){
        // TODO: see if you can do this without side effects
        var namespaceName = avaliableNamespaces[j];
        var currentNamespace = namespaceObject[namespaceName];
        if (currentNamespace.hasOwnProperty(substring)) {
          var token = new TextToken(textTokenBuffer);
          tokens.push(token);
          textTokenBuffer = '';

          var tokenType = currentTopic.toLowerCase() === namespaceName ?
            LocalReferenceToken : ImportReferenceToken;

          var token = new tokenType(substringLowercase, namespaceName);
          tokens.push(token);
          units = units.slice(i + 1, units.length);
          continueFlag = true;
        }
      }
      if(continueFlag){continue;}
    }

    var firstUnit = units.slice(0, 1);
    textTokenBuffer += firstUnit;
    units = units.slice(1);
  }

  if(textTokenBuffer) {
    var token = new TextToken(textTokenBuffer);
    tokens.push(token);
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

function ImportReferenceToken(text, contextName) {
  this.text = text;
  this.context = contextName;
  this.type = 'import';
}

function GlobalReferenceToken(text) {
  this.text = text;
  this.type = 'global';
}

module.exports = parseClause;
