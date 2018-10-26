import unitsOf from '../helpers/units_of';
import capitalize from '../helpers/capitalize';

function parseClause(clauseWithPunctuation, namespaceObject, currentTopic, currentSubtopic, importedNamespaces) {
  var tokens = [];
  var units = unitsOf(clauseWithPunctuation);
  var globalNamespace = namespaceObject;
  var textTokenBuffer = '';

  // Find greatest suffix-prefix match
  while (units.length > 0) {
    for(var i = units.length - 1; i >= 0; i--) {
      if (units[0] === ' ') { break; }
      if (units[i] === ' ') { continue; }

      var substring = units.slice(0, i + 1).join('');
      var substringCapitalized = capitalize(substring);
      if (globalNamespace.hasOwnProperty(substringCapitalized)) {
        if (textTokenBuffer){
          var token = new TextToken(textTokenBuffer);
          tokens.push(token);
          textTokenBuffer = '';
        }

        if (substringCapitalized === currentTopic) {
          break; //Reject self-match
        }

        var token = new GlobalReferenceToken(substringCapitalized, substring);
        tokens.push(token);
        importedNamespaces.push(substringCapitalized);
        units = units.slice(i + 1, units.length);
        continue;
      }

      var avaliableNamespaces = Array.prototype.concat(
        importedNamespaces,
        currentTopic
        );

      var continueFlag = false;
      for(var j = 0; j < avaliableNamespaces.length; j++){
        var namespaceName = avaliableNamespaces[j];
        var currentNamespace = namespaceObject[namespaceName];
        if (currentNamespace.hasOwnProperty(substringCapitalized)) {
          if (substringCapitalized === currentSubtopic) {
            break;
          }

          if (textTokenBuffer){
            var token = new TextToken(textTokenBuffer);
            tokens.push(token);
            textTokenBuffer = '';
          }

          var tokenType = currentTopic === namespaceName ?
            LocalReferenceToken : ImportReferenceToken;

          var token = new tokenType(substringCapitalized, substring, namespaceName);
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

function LocalReferenceToken(key, text, contextName) {
  this.text = text;
  this.key = key
  this.context = contextName;
  this.type = 'local';
}

function ImportReferenceToken(key, text, contextName) {
  this.text = text;
  this.key = key;
  this.context = contextName;
  this.type = 'import';
}

function GlobalReferenceToken(key, text) {
  this.text = text;
  this.key = key;
  this.type = 'global';
}

export default parseClause;
