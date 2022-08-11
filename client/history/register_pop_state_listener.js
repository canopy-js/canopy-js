import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';

function registerPopStateListener() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  window.addEventListener('popstate', (e) => {
    let linkSelection = Link.selectionPresentInEvent(e) ? new Link(e.state) : null;

    updateView(
      Path.currentOrDefault,
      linkSelection || Link.sessionSelection
    );
  });
}

export default registerPopStateListener;
