import unitsOf from 'helpers/units_of';
import capitalize from 'helpers/capitalize';
import withoutArticle from 'helpers/without_article';

function parseClause(clauseWithPunctuation, namespaceObject, currentTopic, currentSubtopic, avaliableNamespaces) {
  let tokens = [];
  let units = unitsOf(clauseWithPunctuation);
  let globalNamespace = namespaceObject;
  let textTokenBuffer = '';

  // Find greatest suffix-prefix match
  while (units.length > 0) {
    for(let i = units.length - 1; i >= 0; i--) {
      if (units[0] === ' ') { break; }
      if (units[i] === ' ') { continue; }

      let substring = units.slice(0, i + 1).join('');
      let substringCapitalized = capitalize(substring);
      let substringToMatch = capitalize(withoutArticle(substringCapitalized));

      let continueFlag = false;
      for (let j = 0; j < avaliableNamespaces.length; j++) {
        let namespaceName = avaliableNamespaces[j];
        let namespaceNameWithoutArticle = capitalize(withoutArticle(namespaceName));
        let currentNamespace = namespaceObject[namespaceNameWithoutArticle];

        if (currentNamespace.hasOwnProperty(substringToMatch)) {
          if (substringToMatch === capitalize(withoutArticle(currentSubtopic))) {
            break;
          }

          if (textTokenBuffer){
            let token = new TextToken(textTokenBuffer);
            tokens.push(token);
            textTokenBuffer = '';
          }

          let tokenType = currentTopic === namespaceName ?
            LocalReferenceToken : GlobalReferenceToken;

          let token = new tokenType(
            namespaceObject[namespaceNameWithoutArticle][namespaceNameWithoutArticle],
            namespaceObject[namespaceNameWithoutArticle][substringToMatch],
            currentTopic,
            currentSubtopic,
            substring,
            clauseWithPunctuation,
          );

          tokens.push(token);
          units = units.slice(i + 1, units.length);
          continueFlag = true;
        }
      }
      if (continueFlag) {continue;}

      if (globalNamespace.hasOwnProperty(substringToMatch)) {
        if (textTokenBuffer){
          let token = new TextToken(textTokenBuffer);
          tokens.push(token);
          textTokenBuffer = '';
        }

        if (substringToMatch === capitalize(withoutArticle(currentTopic))) {
          break; //Reject self-match
        }

        let token = new GlobalReferenceToken(
          namespaceObject[substringToMatch][substringToMatch],
          namespaceObject[substringToMatch][substringToMatch],
          currentTopic,
          currentSubtopic,
          substring,
          clauseWithPunctuation,
        );

        tokens.push(token);
        avaliableNamespaces.push(substringToMatch);
        units = units.slice(i + 1, units.length);
        continue;
      }
    }

    let firstUnit = units.slice(0, 1);
    textTokenBuffer += firstUnit;
    units = units.slice(1);
  }

  if(textTokenBuffer) {
    let token = new TextToken(textTokenBuffer);
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
    text,
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
    text,
  ) {
  this.type = 'global';
  this.targetTopic = targetTopic;
  this.targetSubtopic = targetSubtopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.text = text;
}

export default parseClause;
