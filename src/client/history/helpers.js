import { metadataFromLink } from 'helpers/getters';
import { parsePathString, pathStringFor } from 'path/helpers';

function saveCurrentLinkSelectionInHistoryStack(linkElement) {
  history.replaceState(
    metadataFromLink(linkElement),
    document.title,
    window.location.href
  );
}

function linkSelectionPresentInEvent(e) {
  return e.state && e.state.targetTopic;
}

function priorLinkSelectionDataFromSession() {
  return JSON.parse(
    sessionStorage.getItem(
      pathStringFor(
        parsePathString()
      )
    )
  );
}

function stateIfPresentInHistoryStack() {
  return history.state && history.state.targetTopic && history.state;
}

function priorLinkSelectionData() {
  return stateIfPresentInHistoryStack() || priorLinkSelectionDataFromSession();
}

function storeLinkSelectionInSession(linkElement) {
  let linkData = linkElement && JSON.stringify(metadataFromLink(linkElement));
  linkData && sessionStorage.setItem(location.pathname + location.hash, linkData);
}

export {
  linkSelectionPresentInEvent,
  saveCurrentLinkSelectionInHistoryStack,
  priorLinkSelectionDataFromSession,
  priorLinkSelectionData,
  storeLinkSelectionInSession
};
