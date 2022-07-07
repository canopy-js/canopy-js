import updateView from 'display/update_view';
import { sectionElementContainingLink } from 'helpers/getters';
import Path from 'models/path';

function onLocalLinkClick(targetTopic, targetSubtopic, link) {
  return (e) => {
    e.preventDefault();
    let pathToLink = link.enclosingParagraph.path;
    let newPath, linkToSelect;

    if (e.metaKey && !e.altKey) { // no zoom
      return window.open(location.origin + link.targetPath.string, '_blank');
    }

    if (e.metaKey && e.altKey) { // zoom
      return window.open(location.origin + link.targetPath.lastSegment.string, '_blank');
    }

    if (e.altKey) { //zoom
      let path = link.targetPath.lastSegment;
      return updateView(path, link.atNewPath(path));
    }

    if (link.isOpen) {
      newPath = pathToLink.replaceTerminalSubtopic(link.enclosingParagraph.subtopicName);
    } else {
      newPath = pathToLink.replaceTerminalSubtopic(link.targetSubtopic);
      linkToSelect = link;
    }

    updateView(newPath, linkToSelect);
  };
};

function onGlobalLinkClick (link) {
  return (e) => {
    e.preventDefault();

    let path, linkToSelect;
    if (!e.altKey) {
      if (link.isOpen) { // close global child
        path = link.enclosingParagraph.path;
      } else { // open global child
        path = link.pathToDisplay;
        linkToSelect = link;
      }
    } else { // Redirect to global child
      path = Path.forSegment(link.targetTopic, link.targetSubtopic);
    }

    if (e.metaKey) {
      window.open(
        location.origin + path.string,
        '_blank'
      );
    } else {
      updateView(path, linkToSelect)
    }
  }
}

export { onLocalLinkClick, onGlobalLinkClick };
