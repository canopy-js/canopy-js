import unitsOf from 'helpers/units_of';
import capitalize from 'helpers/capitalize';
import consolidateTextTokens from 'helpers/consolidate_text_tokens';
import {
  ReferenceMatchers,
  MarkdownMatchers,
  BaseMatchers
} from 'components/matchers';
import { removeMarkdownTokens } from 'helpers/identifiers';

function parseSentence(clauseWithPunctuation, parsingContext) {
  let tokensOfClause;

  let parseAllTokens = (newParsingContext) => {
    let result = tokensOfSuffix(
      unitsOf(clauseWithPunctuation),
      newParsingContext,
      parseAllTokens
    )

    if (tokenSetValid(result, parsingContext)) {
      if (!tokensOfClause) {
        tokensOfClause = result;
        parsingContext.avaliableNamespaces = newParsingContext.avaliableNamespaces;
      }
    }
  }

  parseAllTokens(parsingContext);

  return consolidateTextTokens(tokensOfClause);
}

function tokensOfSuffix(units, parsingContext, parseAllTokens) {
  if (units.length === 0) { return []; }

  let prefixObjects = prefixesOf(units);
  let [token, prefixObject] = findMatch(
    prefixObjects,
    parsingContext,
    parseAllTokens
  );

  return [].concat(
    token,
    tokensOfSuffix(
      units.slice(prefixObject.units.length),
      parsingContext,
      parseAllTokens
    ));
}

function prefixesOf(units) {
  let prefixObjects = [];

  for (let i = units.length - 1; i >= 0; i--) {
    let prefixUnits = units.slice(0, i + 1);
    let substring = prefixUnits.join('');
    let substringAsKey = removeMarkdownTokens(capitalize(substring));

    prefixObjects.push({ units: prefixUnits, substring, substringAsKey });
  }

  return prefixObjects;
}

function findMatch(prefixObjects, parsingContext, parseAllTokens) {
  let Matchers = MarkdownMatchers.
    concat(parsingContext.markdownOnly ? [] : ReferenceMatchers).
    concat(BaseMatchers);

  for (let i = 0; i < prefixObjects.length; i++) {
    for (let j = 0; j < Matchers.length; j++) {
      let matcher = Matchers[j];
      let prefixObject = prefixObjects[i];
      let token = matcher(prefixObject, parsingContext, parseAllTokens);
      if (token) return [token, prefixObject];
    }
  }

  throw "No token matched";
}

function tokenSetValid(tokenArray, parsingContext) {
  let result = true;

  tokenArray.forEach((token1) => {
    if (token1.type === 'global') {
      if (!tokenArray.find(
        (token2) => token2.type === 'global' &&
          token1.targetTopic === token2.targetTopic &&
          token1.targetTopic === token2.targetSubtopic
        ) && !parsingContext.avaliableNamespaces.includes(token1.targetTopic)
      ) {
        result = false;
      }
    }
  });

  return result;
}

export default parseSentence;
