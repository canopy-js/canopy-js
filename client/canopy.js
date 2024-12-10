import 'style/canopy.scss';
import updateView from 'display/update_view';
import 'keys/register_key_listeners';
import 'history/register_pop_state_listener';
import Path from 'models/path';
import Link from 'models/link';

updateView(
  Path.initial,
  Link.savedSelection,
  { scrollStyle: 'instant', initialLoad: true, scrollToParagraph: true }
)
