import { slugFor } from 'helpers/identifiers';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers';

const setPathAndFragment = (topicName, subtopicName) => {
  // Do nothing if
  if (topicNameFromUrl() === topicName && // the topic is already set correctly
    (subtopicNameFromUrl() === subtopicName || // and either the subtopic is already set in the fragment id
      (topicName === subtopicName && subtopicNameFromUrl() === ''))) { // or there is no fragment id because there is no subtopic
    return;
  }

  var replaceState = (a, b, c) => { history.replaceState(a, b, c) };
  var pushState = (a, b, c) => { history.pushState(a, b, c) };
  var historyApiFunction = topicNameFromUrl() === topicName ? replaceState : pushState;

  if (!subtopicName) {
    historyApiFunction({}, topicName, '/' + slugFor(topicName));
  } else if (subtopicName && topicName !== subtopicName) {
    historyApiFunction(
      {},
      topicName + ': ' + subtopicName,
      '/' + slugFor(topicName) + '#' + slugFor(subtopicName)
    );
  } else {
    historyApiFunction({}, topicName, '/' + slugFor(topicName));
  }


  var popStateEvent = new PopStateEvent('popstate');
  dispatchEvent(popStateEvent);
}

export default setPathAndFragment;
