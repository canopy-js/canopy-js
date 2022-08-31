import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';

function registerPopStateListener() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  window.addEventListener('popstate', (e) => {
    let linkSelection = Link.selectionPresentInEvent(e) ? new Link(e.state) : null;

    try { linkSelection.element; } catch { linkSelection = null; } // in case metadata is invalid

    let scrollStyle;
    if (Paragraph.current.path.rootTopicPath.equals(Path.current.rootTopicPath)) { // Navigating within the same page
      scrollStyle = 'smooth';
    } else { // Nagivating to a new page
      scrollStyle = 'auto';
    }

    updateView(
      Path.currentOrDefault,
      linkSelection || Link.sessionSelection,
      { scrollStyle }
    );
  });
}

export default registerPopStateListener;
