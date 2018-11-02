import { slugFor } from 'helpers/identifiers';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers';
import { selectedLink, linkNumberOf, currentLinkNumberAndLinkTypeAsObject } from 'helpers/getters';

const setPathAndFragment = (topicName, subtopicName, selectedLinkInParentSection, selectedLinkNumber) => {
  var replaceState = (a, b, c) => { history.replaceState(a, b, c) };
  var pushState = (a, b, c) => {
    history.pushState(a, b, c);
  };
  var historyApiFunction = topicNameFromUrl() === topicName ? replaceState : pushState;

  var subtopicTitleString = uniqueSubtopic() ? (': ' + subtopicName) : '';
  var titleString = topicName + subtopicTitleString
  var fragmentIdString = uniqueSubtopic() ? '#' + slugFor(subtopicName) : '';

  historyApiFunction(
    {},
    topicName + ': ' + subtopicName,
    '/' + slugFor(topicName) + fragmentIdString
  );

  var popStateEvent = new PopStateEvent(
    'popstate',
    {
      state: nextLinkNumberAndLinkTypeAsObject(
        selectedLinkInParentSection,
        selectedLinkNumber
      )
    }
  );

  dispatchEvent(popStateEvent);

  function uniqueSubtopic() {
    return subtopicName && subtopicName !== topicName;
  }
}

function nextLinkNumberAndLinkTypeAsObject(selectedLinkInParentSection, selectedLinkNumber) {
  return {
    selectedLinkNumber,
    selectedLinkInParentSection
  };
}

export default setPathAndFragment;
