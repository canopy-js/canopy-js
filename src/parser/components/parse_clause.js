import unitsOf from 'helpers/units_of';
import capitalize from 'helpers/capitalize';
import withoutArticle from 'helpers/without_article';
import {
  LocalReferenceToken,
  GlobalReferenceToken,
  TextToken,
  consolidateTextTokens
} from 'components/tokens';

function parseClause(
  clauseWithPunctuation,
  displaySubtopicsByTopicAndSubtopic,
  currentTopic,
  currentSubtopic,
  avaliableNamespaces
) {
  let units = unitsOf(clauseWithPunctuation);

  return consolidateTextTokens(
    tokensOfSuffix(
      units,
      displaySubtopicsByTopicAndSubtopic,
      currentTopic,
      currentSubtopic,
      avaliableNamespaces
    )
  );
}

function tokensOfSuffix(
  units,
  displaySubtopicsByTopicAndSubtopic,
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
        displaySubtopicsByTopicAndSubtopic,
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
      displaySubtopicsByTopicAndSubtopic,
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
    let substringAsKey = capitalize(withoutArticle(capitalize(substring)));

    prefixObjects.push({units: prefixUnits, substring, substringAsKey});
  }

  return prefixObjects;
}

const Matchers = [
  function localReferenceMatcher(
    prefixObject,
    displaySubtopicsByTopicAndSubtopic,
    currentTopic,
    currentSubtopic
  ) {
    if (
      displaySubtopicsByTopicAndSubtopic[currentTopic].hasOwnProperty(prefixObject.substringAsKey) &&
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
    displaySubtopicsByTopicAndSubtopic,
    currentTopic,
    currentSubtopic,
    avaliableNamespaces
  ) {
    if (
      displaySubtopicsByTopicAndSubtopic.hasOwnProperty(prefixObject.substringAsKey) &&
      currentTopic !== prefixObject.substringAsKey
      ) {
      avaliableNamespaces.push(prefixObject.substringAsKey);
      return new GlobalReferenceToken(
        displaySubtopicsByTopicAndSubtopic[prefixObject.substringAsKey][prefixObject.substringAsKey],
        displaySubtopicsByTopicAndSubtopic[prefixObject.substringAsKey][prefixObject.substringAsKey],
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
    displaySubtopicsByTopicAndSubtopic,
    currentTopic,
    currentSubtopic,
    avaliableNamespaces
  ) {
    return findAndReturnResult(avaliableNamespaces, (namespaceNameAsKey) => {
      if (displaySubtopicsByTopicAndSubtopic[namespaceNameAsKey].hasOwnProperty(prefixObject.substringAsKey)){
        return new GlobalReferenceToken(
          displaySubtopicsByTopicAndSubtopic[namespaceNameAsKey][namespaceNameAsKey],
          displaySubtopicsByTopicAndSubtopic[namespaceNameAsKey][prefixObject.substringAsKey],
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
