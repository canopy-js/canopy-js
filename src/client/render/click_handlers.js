import updateView from 'display/update_view';
import { sectionElementContainingLink } from 'helpers/getters';
import Path from 'models/path';

function onParentLinkClick (targetTopic, targetSubtopic, link) {
  return (e) => {
    e.preventDefault();
    // If the link's child is already selected, display the link's section
    let path = link.enclosingParagraph.path;
    let newPath = path.withoutLastSegment;

    if (link.isOpen) {
      newPath = newPath.addSegment(link.enclosingTopic, link.enclosingSubtopic);
    } else {
      newPath = newPath.addSegment(link.targetTopic, link.targetSubtopic);
    }

    updateView(newPath);
  };
};

function onGlobalLinkClick (link) {
  return (e) => {
    e.preventDefault();

    let path;
    if (e.altKey) {
      path = link.enclosingParagraph.path;
      if (!link.isOpen) {
        path = path.addSegment(link.targetTopic, link.targetSubtopic);
      }
    } else {
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
