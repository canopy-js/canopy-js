import { canopyContainer, defaultTopic } from 'helpers/getters';
import renderTopic from 'render/render_topic';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers'
import setPathAndFragment from 'helpers/set_path_and_fragment';
import css from 'style/canopy.css';
import registerKeyListener from 'keys/register_key_listener';

if (!topicNameFromUrl()) {
  setPathAndFragment(defaultTopic, null);
} else {
  renderTopic(topicNameFromUrl(), subtopicNameFromUrl() || topicNameFromUrl());
}

registerKeyListener();

window.addEventListener('popstate', (e) => {
  renderTopic(topicNameFromUrl(), subtopicNameFromUrl() || topicNameFromUrl());
});
