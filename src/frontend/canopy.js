import { canopyContainer, defaultTopic } from 'helpers/getters';
import displayTopic from 'display/display_topic';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers'
import setPathAndFragment from 'helpers/set_path_and_fragment';

if (!topicNameFromUrl()) {
  setPathAndFragment(defaultTopic, null);
}

displayTopic(topicNameFromUrl(), subtopicNameFromUrl());

window.addEventListener('hashchange', (e) => {

});
