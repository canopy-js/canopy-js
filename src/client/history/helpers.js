import { metadataForLink } from 'helpers/getters';
import Path from 'models/path';

function saveCurrentLinkSelectionInHistoryStack(linkElement) {
  history.replaceState(
    metadataForLink(linkElement),
    document.title,
    window.location.href
  );
}

function linkSelectionPresentInEvent(e) {
  return e.state && e.state.targetTopic;
}

function priorLinkSelectionDataFromSession() {
  return JSON.parse(sessionStorage.getItem(Path.current.string));
}

function stateIfPresentInHistoryStack() {
  return history.state && history.state.targetTopic && history.state;
}

function priorLinkSelectionData() {
  return stateIfPresentInHistoryStack() || priorLinkSelectionDataFromSession();
}

function storeLinkSelectionInSession(linkElement) {
  let linkData = linkElement && JSON.stringify(metadataForLink(linkElement));
  sessionStorage.setItem(location.pathname + location.hash, linkData);
}

export {
  linkSelectionPresentInEvent,
  saveCurrentLinkSelectionInHistoryStack,
  priorLinkSelectionDataFromSession,
  priorLinkSelectionData,
  storeLinkSelectionInSession
};
