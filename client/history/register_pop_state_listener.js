import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';

function registerPopStateListener() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  history.replaceState(history.state, document.title, window.location.href); // no-op call to put initial path in history API

  window.addEventListener('popstate', (e) => {
    let linkSelection = e?.state?.linkSelection ? new Link(e?.state?.linkSelection) : null;

    let scrollStyle;
    if (Path.current.rootTopicPath.equals(Path.url.rootTopicPath)) { // Navigating within the same page
      scrollStyle = 'smooth';
    } else { // Nagivating to a new page
      scrollStyle = 'instant';
    }

    updateView(
      Path.url,
      linkSelection || Path.url.parentLink,
      { scrollStyle, scrollDirect: true, popState: true, scrollToParagraph: true }
    );
  });
}

registerPopStateListener();
