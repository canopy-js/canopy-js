import unitsOf from '../helpers/units_of';
import capitalize from '../helpers/capitalize';

function parseClause(clauseWithPunctuation, namespaceObject, currentTopic, currentSubtopic, avaliableNamespaces) {
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
            LocalReferenceToken : GlobalReferenceToken;

          var token = new tokenType(
            namespaceName,
            substringCapitalized,
            currentTopic,
            currentSubtopic,
            substring,
            clauseWithPunctuation
          );
          tokens.push(token);
          units = units.slice(i + 1, units.length);
          continueFlag = true;
        }
      }
      if(continueFlag){continue;}

      if (globalNamespace.hasOwnProperty(substringCapitalized)) {
        if (textTokenBuffer){
          var token = new TextToken(textTokenBuffer);
          tokens.push(token);
          textTokenBuffer = '';
        }

        if (substringCapitalized === currentTopic) {
          break; //Reject self-match
        }

        var token = new GlobalReferenceToken(
          substringCapitalized,
          substringCapitalized,
          currentTopic,
          currentSubtopic,
          substring,
          clauseWithPunctuation
        );
        tokens.push(token);
        avaliableNamespaces.push(substringCapitalized);
        units = units.slice(i + 1, units.length);
        continue;
      }
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

function LocalReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text
  ) {
  this.type = 'local';
  this.text = text;
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function GlobalReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text
  ) {
  this.type = 'global';
  this.targetTopic = targetTopic;
  this.targetSubtopic = targetSubtopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.text = text;
}

export default parseClause;
