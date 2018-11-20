import {
  canopyContainer,
  defaultTopic,
  metadataFromLink,
  selectedLink
} from 'helpers/getters';

import renderTopic from 'render/render_topic';
import setPathAndFragment from 'path/set_path';
import css from 'style/canopy.scss';
import registerKeyListener from 'keys/register_key_listener';
import registerAltKeyListener from 'keys/register_alt_key_listener';
import parsePathString from 'path/parse_path_array';

if (!parsePathString()[0][0]) {
  setPathAndFragment(defaultTopic, null);
} else {
  renderTopic(
    parsePathString(),
    null,
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
    parsePathString(),
    selectedLinkData
  );
});
