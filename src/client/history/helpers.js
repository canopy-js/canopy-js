import { metadataFromLink } from 'helpers/getters';

function linkSelectionPresentInEvent(e) {
  return e.state && e.state.targetTopic;
}

function saveCurrentLinkSelectionInHistoryStack(linkElement) {
  history.replaceState(
    metadataFromLink(linkElement),
    document.title,
    window.location.href
  );
}

export {
  linkSelectionPresentInEvent,
  saveCurrentLinkSelectionInHistoryStack
};
