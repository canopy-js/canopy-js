import {
  saveCurrentLinkSelectionInHistoryStack,
  linkSelectionPresentInEvent
} from 'history/helpers';
import { priorLinkSelectionFromSession } from 'history/helpers';
import updateView from 'display/update_view';
import { parsePathString } from 'path/helpers';
import { selectedLink } from 'helpers/getters';

function registerPopStateListener() {
  window.addEventListener('popstate', (e) => {
    saveCurrentLinkSelectionInHistoryStack(selectedLink());

    let newLinkSelectionData = linkSelectionPresentInEvent(e) ? e.state : null;

    updateView(
      parsePathString(),
      newLinkSelectionData || priorLinkSelectionFromSession(),
      null,
      true
    );
  });
}

export default registerPopStateListener;
