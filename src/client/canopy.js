import css from 'style/canopy.scss';
import updateView from 'display/update_view';
import registerKeyListeners from 'keys/register_key_listeners';
import registerPopStateListener from 'history/register_pop_state_listener';
import { priorLinkSelectionData } from 'history/helpers';
import Path from 'models/path';

registerKeyListeners();
registerPopStateListener();

updateView(
  Path.initial,
  { linkSelectionData: priorLinkSelectionData() }
);
