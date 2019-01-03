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
import parsePathString from 'path/parse_path_string';

// history.state.paths = {};
// if (!parsePathString()[0]) {
//   setPathAndFragment(defaultTopic, null);
// } else {

updateView(
  parsePathString(),
  history.state,
  null
);
// }

registerKeyListener();

window.addEventListener('popstate', (e) => {
  let oldState = Object.assign(
    history.state || {}, metadataFromLink(selectedLink())
  );

  history.replaceState(
    Object.assign(history.state || {}, oldState),
    document.title,
    window.location.href
  );

  let selectedLinkData = e.state && e.state.targetTopic ? e.state : null;

  updateView(
    parsePathString(),
    selectedLinkData,
    null,
    true
  );
});
