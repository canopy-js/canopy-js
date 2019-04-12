import updateView from 'display/update_view';
import { sectionElementOfLink } from 'helpers/getters';
import { pathForSectionElement } from 'path/helpers';
import parsePathString from 'path/parse_path_string';
import pathStringFor from 'path/path_string_for';

const onParentLinkClick = (topicName, targetSubtopic, linkElement) => {
  return (e) => {
    e.preventDefault();
    // If the link's child is already selected, display the link's section
    let pathArray = pathForSectionElement(sectionElementOfLink(linkElement));

    if (linkElement.classList.contains('canopy-open-link')) {
      pathArray.pop();
      let newTuple = [linkElement.dataset.enclosingTopic, linkElement.dataset.enclosingSubtopic];
      pathArray.push(newTuple);
    } else {
      pathArray.pop();
      let newTuple = [topicName, targetSubtopic];
      pathArray.push(newTuple);
    }

    updateView(pathArray);
  }
}

const onGlobalLinkClick = (targetTopic, targetSubtopic, linkElement) => {
  return (e) => {
    e.preventDefault();

    let pathArray
    if (e.altKey) {
      pathArray = pathForSectionElement(sectionElementOfLink(linkElement))

      if (!linkElement.classList.contains('canopy-open-link')) {
        pathArray.push([
          linkElement.dataset.targetTopic,
          linkElement.dataset.targetSubtopic
        ]);
      }
    } else {
      pathArray = [[targetTopic, targetSubtopic]];
    }

    if (e.metaKey) {
      window.open(
        location.origin + pathStringFor(pathArray),
        '_blank'
      );
    } else {
      updateView(pathArray)
    }
  }
}

export { onParentLinkClick, onGlobalLinkClick };
