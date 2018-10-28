import { slugFor } from 'helpers/identifiers';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers';

const setPathAndFragment = (topicName, subtopicName) => {
  // Do nothing if
  if (topicNameFromUrl() === topicName && // the topic is already set correctly
    (subtopicNameFromUrl() === subtopicName || // and either the subtopic is already set in the fragment id
      (topicName === subtopicName && subtopicNameFromUrl() === ''))) { // or there is no fragment id because there is no subtopic
    return;
  }

  if (!subtopicName) {
    history.pushState("", document.title, '/' + slugFor(topicName) + window.location.search);
  } else if (subtopicName && topicName !== subtopicName) {
    history.pushState(
      "", document.title,
      '/' + slugFor(topicName) + '#' + slugFor(subtopicName) + window.location.search
    );
  } else {
    history.pushState("", document.title, '/' + slugFor(topicName) + window.location.search);
  }

  var popStateEvent = new PopStateEvent('popstate');
  dispatchEvent(popStateEvent);
}

export default setPathAndFragment;
