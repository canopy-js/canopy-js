import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';

function registerPopStateListener() {
  window.addEventListener('popstate', (e) => {
    let linkSelection = Link.selectionPresentInEvent(e) ? new Link(e.state) : null;

    updateView(
      Path.currentOrDefault,
      linkSelection || Link.sessionSelection
    );
  });
}

export default registerPopStateListener;
