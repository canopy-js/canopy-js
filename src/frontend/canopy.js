import { canopyContainer, defaultTopic } from 'helpers/getters';
import renderTopic from 'render/render_topic';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers'
import setPathAndFragment from 'helpers/set_path_and_fragment';
import css from 'style/canopy.css';

if (!topicNameFromUrl()) {
  setPathAndFragment(defaultTopic, null);
}

renderTopic(topicNameFromUrl(), subtopicNameFromUrl() || topicNameFromUrl());

window.addEventListener('hashchange', (e) => {
  renderTopic(topicNameFromUrl(), subtopicNameFromUrl() || topicNameFromUrl());
});
