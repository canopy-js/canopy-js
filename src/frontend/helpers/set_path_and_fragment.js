import { toSlug } from 'helpers/id_generators';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers';

const setPathAndFragment = (topicName, subtopicName) => {
  if (topicNameFromUrl() === toSlug(topicName) &&
    subtopicNameFromUrl() === toSlug(subtopicName)) {
    return;
  }

  window.location.pathname = '/' + toSlug(topicName);
  if (subtopicName) {
    window.location.href = '#' + toSlug(subtopicName);
  }
}

export default setPathAndFragment;
