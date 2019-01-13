import unitsOf from 'helpers/units_of';
import capitalize from 'helpers/capitalize';
import {
  LocalReferenceToken,
  GlobalReferenceToken,
  TextToken,
  consolidateTextTokens
} from 'components/tokens';

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

function findAndReturnResult(array, callback) {
  let foundItem = array.find((item) => callback(item));
  return foundItem && callback(foundItem);
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

const Matchers = [
  function localReferenceMatcher(
    prefixObject,
    topicSubtopics,
    currentTopic,
    currentSubtopic
  ) {
    if (
      topicSubtopics[currentTopic].hasOwnProperty(prefixObject.substringAsKey) &&
      currentSubtopic !== prefixObject.substringAsKey &&
      currentTopic !== prefixObject.substringAsKey
      ){
      return new LocalReferenceToken(
        currentTopic,
        prefixObject.substringAsKey,
        currentTopic,
        currentSubtopic,
        prefixObject.substring,
        prefixObject.units
      );
    } else {
      return null;
    };
  },

  function globalReferenceMatcher(
    prefixObject,
    topicSubtopics,
    currentTopic,
    currentSubtopic,
    avaliableNamespaces
  ) {
    if (
      topicSubtopics.hasOwnProperty(prefixObject.substringAsKey) &&
      currentTopic !== prefixObject.substringAsKey
      ) {
      avaliableNamespaces.push(prefixObject.substringAsKey);

      return new GlobalReferenceToken(
        prefixObject.substringAsKey,
        prefixObject.substringAsKey,
        currentTopic,
        currentSubtopic,
        prefixObject.substring,
        prefixObject.units
      );
    } else {
      return null;
    }
  },

  function importReferenceMatcher(
    prefixObject,
    topicSubtopics,
    currentTopic,
    currentSubtopic,
    avaliableNamespaces
  ) {
    return findAndReturnResult(avaliableNamespaces, (namespaceNameAsKey) => {
      if (topicSubtopics[namespaceNameAsKey].hasOwnProperty(prefixObject.substringAsKey)){
        return new GlobalReferenceToken(
          namespaceNameAsKey,
          prefixObject.substringAsKey,
          currentTopic,
          currentSubtopic,
          prefixObject.substring,
          prefixObject.units
        );
      }
    }) || null;
  },

  function textMatcher(prefixObject) {
    if (prefixObject.units.length !== 1) {
     return null;
    } else {
     return new TextToken(prefixObject.substring, prefixObject.units);
    }
  }
];


export default parseClause;
