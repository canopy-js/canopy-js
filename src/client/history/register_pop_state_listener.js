import {
  saveCurrentLinkSelectionInHistoryStack,
  linkSelectionPresentInEvent
} from 'history/helpers';
import { priorLinkSelectionDataFromSession } from 'history/helpers';
import updateView from 'display/update_view';
import { selectedLink } from 'helpers/getters';
import Path from 'models/path';

function registerPopStateListener() {
  window.addEventListener('popstate', (e) => {
    saveCurrentLinkSelectionInHistoryStack(selectedLink());

    let newLinkSelectionData = linkSelectionPresentInEvent(e) ? e.state : null;

    updateView(
      Path.current,
      {
        linkSelectionData: newLinkSelectionData || priorLinkSelectionDataFromSession(),
        pathAlreadyChanged: true
      }
    );
  });
}

export default registerPopStateListener;
