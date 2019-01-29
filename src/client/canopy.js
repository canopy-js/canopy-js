import css from 'style/canopy.scss';
import updateView from 'display/update_view';
import registerKeyListeners from 'keys/register_key_listeners';
import registerPopStateListener from 'history/register_pop_state_listener';
import parsePathString from 'path/parse_path_string';
import 'dom-shims';

registerKeyListeners();
registerPopStateListener();

updateView(
  parsePathString(),
  history.state
);
