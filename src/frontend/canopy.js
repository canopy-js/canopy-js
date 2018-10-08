import { canopyContainer, defaultTopic } from 'helpers/getters';
import displayTopic from 'display/display_topic';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers'

if(topicNameFromUrl()) {
  displayTopic(topicNameFromUrl(), subtopicNameFromUrl());
} else {
  displayTopic(defaultTopic, null);
}

window.addEventListener('hashchange', (e) => {

});
