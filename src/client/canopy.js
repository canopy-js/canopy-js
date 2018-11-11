import {
  canopyContainer,
  defaultTopic,
  metadataFromLink,
  selectedLink
} from 'helpers/getters';

import renderTopic from 'render/render_topic';
import { topicNameFromUrl, subtopicNameFromUrl } from 'helpers/url_parsers'
import setPathAndFragment from 'helpers/set_path_and_fragment';
import css from 'style/canopy.css';
import registerKeyListener from 'keys/register_key_listener';
import registerAltKeyListener from 'keys/register_alt_key_listener';

if (!topicNameFromUrl()) {
  setPathAndFragment(defaultTopic, null);
} else {
  renderTopic(
    topicNameFromUrl(),
    subtopicNameFromUrl() || topicNameFromUrl(),
    history.state
  );
}

registerKeyListener();
registerAltKeyListener();

window.addEventListener('popstate', (e) => {
  var oldState = Object.assign(
    history.state || {}, metadataFromLink(selectedLink())
  );

  history.replaceState(
    Object.assign(history.state || {}, oldState),
    document.title,
    window.location.href
  );

  var selectedLinkData = e.state && e.state.targetTopic ? e.state : null;

  renderTopic(
    topicNameFromUrl(),
    subtopicNameFromUrl() || topicNameFromUrl(),
    selectedLinkData
  );
});
