import 'style/canopy.scss';
import updateView from 'display/update_view';
import registerKeyListeners from 'keys/register_key_listeners';
import registerPopStateListener from 'history/register_pop_state_listener';
import Path from 'models/path';
import Link from 'models/link';

registerKeyListeners();
registerPopStateListener();

updateView(
  Path.currentOrDefault,
  Link.priorSelection,
  { scrollStyle: 'auto' }
);
