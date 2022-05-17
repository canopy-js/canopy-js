import updateView from 'display/update_view';
import { sectionElementContainingLink } from 'helpers/getters';
import { pathForSectionElement } from 'path/helpers';
import Path from 'models/path';

function onParentLinkClick (topicName, targetSubtopic, linkElement) {
  return (e) => {
    e.preventDefault();
    // If the link's child is already selected, display the link's section
    let path = pathForSectionElement(sectionElementContainingLink(linkElement));
    let newPath = path.withoutLastSegment;

    if (linkElement.classList.contains('canopy-open-link')) {
      newPath = newPath.
      addSegment(
        linkElement.dataset.enclosingTopic,
        linkElement.dataset.enclosingSubtopic
      );
    } else {
      newPath = newPath.addSegment(topicName, targetSubtopic);
    }

    updateView(newPath);
  };
};

function onGlobalLinkClick (targetTopic, targetSubtopic, linkElement) {
  return (e) => {
    e.preventDefault();

    let path;
    if (e.altKey) {
      path = pathArrayForSectionElement(sectionElementContainingLink(linkElement))

      if (!linkElement.classList.contains('canopy-open-link')) {
        path = path.addSegment(
          linkElement.dataset.targetTopic,
          linkElement.dataset.targetSubtopic
        );
      }
    } else {
      path = new Path([[targetTopic, targetSubtopic]]);
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
