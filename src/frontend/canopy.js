import { canopyContainer, defaultTopic } from 'helpers/getters';
import displayTopic from 'display/display_topic';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers'
import setPathAndFragment from 'helpers/set_path_and_fragment';
import css from 'style/canopy.css';

if (!topicNameFromUrl()) {
  setPathAndFragment(defaultTopic, null);
}

displayTopic(topicNameFromUrl(), subtopicNameFromUrl());

window.addEventListener('hashchange', (e) => {

});
