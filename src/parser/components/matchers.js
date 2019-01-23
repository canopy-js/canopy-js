import findAndReturnResult from 'helpers/find_and_return_result';
import {
  LocalReferenceToken,
  GlobalReferenceToken,
  TextToken
} from 'components/tokens';

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

export default Matchers;
