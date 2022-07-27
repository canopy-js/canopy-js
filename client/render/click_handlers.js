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

function onGlobalAndImportLinkClick (link) {
  return (e) => {
    e.preventDefault();
    let path, linkToSelect;

    if (!e.metaKey) {
      if (!e.altKey) { // inline
        if (link.isSelected) { // close global child
          path = link.enclosingParagraph.path;
        } else { // open global child
          path = link.paragraphPathWhenSelected;
          linkToSelect = link;
        }
      } else { // Redirect to global child
        path = Path.forSegment(link.targetTopic, link.targetSubtopic);
      }
      return updateView(path, linkToSelect)
    }

    if (e.metaKey) {
      if (!e.altKey) { // inline
        path = link.paragraphPathWhenSelected; // open the link in new tab
      } else { // Redirect to global child
        path = Path.forSegment(link.targetTopic, link.targetSubtopic);
      }

      window.open(
        location.origin + path.string,
        '_blank'
      );
    }
  }
}

export { onLocalLinkClick, onGlobalAndImportLinkClick };
