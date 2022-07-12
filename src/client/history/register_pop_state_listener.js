import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';

function registerPopStateListener() {
  window.addEventListener('popstate', (e) => {
    Link.persistInHistory(Link.selection);
    Link.persistInSession(Link.selection);

    let linkSelection = Link.selectionPresentInEvent(e) ? new Link(e.state) : null;

    updateView(
      Path.current,
      linkSelection || Link.sessionSelection,
      {
        pathAlreadySet: true
      }
    );
  });
}

export default registerPopStateListener;
