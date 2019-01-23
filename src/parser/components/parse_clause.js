import unitsOf from 'helpers/units_of';
import capitalize from 'helpers/capitalize';
import consolidateTextTokens from 'helpers/consolidate_text_tokens';
import Matchers from 'components/matchers';
import findAndReturnResult from 'helpers/find_and_return_result';

function parseClause(
  clauseWithPunctuation,
  topicSubtopics,
  currentTopic,
  currentSubtopic,
  avaliableNamespaces
) {
  let units = unitsOf(clauseWithPunctuation);

  return consolidateTextTokens(
    tokensOfSuffix(
      units,
      topicSubtopics,
      currentTopic,
      currentSubtopic,
      avaliableNamespaces
    )
  );
}

function tokensOfSuffix(
  units,
  topicSubtopics,
  currentTopic,
  currentSubtopic,
  avaliableNamespaces
) {
  if (units.length === 0) { return []; }
  let prefixObjects = prefixesOf(units);

  let token = findAndReturnResult(prefixObjects,
    (prefixObject) => findAndReturnResult(Matchers,
      (matcher) => matcher(
        prefixObject,
        topicSubtopics,
        currentTopic,
        currentSubtopic,
        avaliableNamespaces
      )
    )
  );

  return [].concat(
    token,
    tokensOfSuffix(
      units.slice(token.units.length),
      topicSubtopics,
      currentTopic,
      currentSubtopic,
      avaliableNamespaces
    ));
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
