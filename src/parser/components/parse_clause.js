import unitsOf from 'helpers/units_of';
import capitalize from 'helpers/capitalize';
import consolidateTextTokens from 'helpers/consolidate_text_tokens';
import {
  ReferenceMatchers,
  MarkdownMatchers,
  BaseMatchers
} from 'components/matchers';

function parseClause(clauseWithPunctuation, parsingContext) {
  let units = unitsOf(clauseWithPunctuation);

  return consolidateTextTokens(
    doWithBacktracking(
      () => [unitsOf(clauseWithPunctuation), parsingContext],
      tokensOfSuffix
    )
  );
}

function doWithBacktracking(generateArguments, callback) {
  let result;
  while(!result) {
    try {
      let argumentsArray = generateArguments();
      result = callback.apply(null, argumentsArray);
    } catch(e) {
      if (e.name !== 'clauseReparseRequired') {
        throw e;
      }
    }
  }

  return result;
}

function tokensOfSuffix(units, parsingContext) {
  if (units.length === 0) { return []; }

  let prefixObjects = prefixesOf(units);
  let [token, prefixObject] = findMatch(
    prefixObjects,
    parsingContext
  );

  return [].concat(
    token,
    tokensOfSuffix(
      units.slice(prefixObject.units.length),
      parsingContext
    ));
}

function findMatch(prefixObjects, parsingContext) {
  let Matchers = MarkdownMatchers.
    concat(parsingContext.markdownOnly ? [] : ReferenceMatchers).
    concat(BaseMatchers);

  for (let i = 0; i < prefixObjects.length; i++) {
    for (let j = 0; j < Matchers.length; j++) {
      let matcher = Matchers[j];
      let prefixObject = prefixObjects[i];
      // console.log([matcher, prefixObject.substringAsKey])
      let token = matcher(prefixObject, parsingContext);
      if (token) return [token, prefixObject];
    }
  }
}

function prefixesOf(units) {
  let prefixObjects = [];

  for (let i = units.length - 1; i >= 0; i--) {
    let prefixUnits = units.slice(0, i + 1);
    let substring = prefixUnits.join('');
    let substringAsKey = capitalize(substring);

    prefixObjects.push({units: prefixUnits, substring, substringAsKey});
  }

  return prefixObjects;
}

export default parseClause;
