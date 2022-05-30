import updateView from 'display/update_view';
import { sectionElementContainingLink } from 'helpers/getters';
import Path from 'models/path';

function onParentLinkClick (targetTopic, targetSubtopic, link) {
  return (e) => {
    e.preventDefault();
    let pathToLink = link.enclosingParagraph.path;
    let newPath;

    if (link.isOpen) {
      newPath = pathToLink.replaceTerminalSubtopic(link.enclosingParagraph.subtopicName);
    } else {
      newPath = pathToLink.replaceTerminalSubtopic(link.targetSubtopic);
    }

    updateView(newPath);
  };
};

function onGlobalLinkClick (link) {
  return (e) => {
    e.preventDefault();

    let path;
    if (e.altKey) {
      if (link.isOpen) { // close global child
        path = link.enclosingParagraph.path;
      } else { // open global child
        path = link.pathWhenSelected;
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
      updateView(path)
    }
  }
}

export { onParentLinkClick, onGlobalLinkClick };
