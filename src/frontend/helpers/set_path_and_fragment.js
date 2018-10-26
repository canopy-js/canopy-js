import { slugFor } from 'helpers/identifiers';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers';

const setPathAndFragment = (topicName, subtopicName) => {
  if (topicNameFromUrl() === slugFor(topicName) &&
    subtopicNameFromUrl() === slugFor(subtopicName)) {
    return;
  }

  window.location.pathname = '/' + slugFor(topicName);
  if (subtopicName) {
    window.location.href = '#' + slugFor(subtopicName);
  }
}

export default setPathAndFragment;
