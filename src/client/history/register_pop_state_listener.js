import {
  saveCurrentLinkSelectionInHistoryStack,
  linkSelectionPresentInEvent
} from 'history/helpers';
import { priorLinkSelectionDataFromSession } from 'history/helpers';
import updateView from 'display/update_view';
import parsePathString from 'path/parse_path_string';
import { selectedLink } from 'helpers/getters';

function registerPopStateListener() {
  window.addEventListener('popstate', (e) => {
    saveCurrentLinkSelectionInHistoryStack(selectedLink());

    let newLinkSelectionData = linkSelectionPresentInEvent(e) ? e.state : null;

    updateView(
      parsePathString(),
      {
        linkSelectionData: newLinkSelectionData || priorLinkSelectionDataFromSession(),
        originatesFromPopStateEvent: true
      }
    );
  });
}

export default registerPopStateListener;
