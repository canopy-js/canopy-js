import {
  saveCurrentLinkSelectionInHistoryStack,
  linkSelectionPresentInEvent
} from 'history/helpers';

import updateView from 'render/update_view';
import parsePathString from 'path/parse_path_string';
import { selectedLink } from 'helpers/getters';

function registerPopStateListener() {
  window.addEventListener('popstate', (e) => {
    saveCurrentLinkSelectionInHistoryStack(selectedLink());

    let newLinkSelectionData = linkSelectionPresentInEvent(e) ? e.state : null;

    updateView(
      parsePathString(),
      newLinkSelectionData,
      null,
      true
    );
  });
}

export default registerPopStateListener;
