import css from 'style/canopy.scss';
import updateView from 'display/update_view';
import { pathOrDefaultTopic } from 'path/helpers';
import registerKeyListeners from 'keys/register_key_listeners';
import registerPopStateListener from 'history/register_pop_state_listener';
import { priorLinkSelectionData } from 'history/helpers';

registerKeyListeners();
registerPopStateListener();

updateView(
  pathOrDefaultTopic(),
  { linkSelectionData: priorLinkSelectionData() }
);
