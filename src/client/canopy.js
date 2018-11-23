import {
  canopyContainer,
  defaultTopic,
  metadataFromLink,
  selectedLink
} from 'helpers/getters';

import updateView from 'render/update_view';
import setPathAndFragment from 'path/set_path';
import css from 'style/canopy.scss';
import registerKeyListener from 'keys/register_key_listener';
import registerAltKeyListener from 'keys/register_alt_key_listener';
import parsePathString from 'path/parse_path_array';

// if (!parsePathString()[0]) {
//   setPathAndFragment(defaultTopic, null);
// } else {
updateView(
  parsePathString(),
  null,
  history.state
);
// }

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

  updateView(
    parsePathString(),
    selectedLinkData
  );
});
