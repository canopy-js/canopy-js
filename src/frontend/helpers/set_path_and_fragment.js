import { slugFor } from 'helpers/identifiers';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers';

const setPathAndFragment = (topicName, subtopicName) => {
  if (topicNameFromUrl() === slugFor(topicName) &&
    subtopicNameFromUrl() === slugFor(subtopicName)) {
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
