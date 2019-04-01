import updateView from 'display/update_view';
import { sectionElementOfLink } from 'helpers/getters';
import { pathForSectionElement, parsePathString } from 'path/helpers'

const onParentLinkClick = (topicName, targetSubtopic, linkElement) => {
  return (e) => {
    e.preventDefault();
    // If the link's child is already selected, display the link's section
    let pathArray = pathForSectionElement(sectionElementOfLink(linkElement));

    if (linkElement.classList.contains('canopy-open-link')) {
      pathArray.pop();
      let newTuple = [linkElement.dataset.enclosingTopic, linkElement.dataset.enclosingSubtopic];
      pathArray.push(newTuple);

      updateView(pathArray);
    } else {
      pathArray.pop();
      let newTuple = [topicName, targetSubtopic];
      pathArray.push(newTuple);

      updateView(pathArray);
    }
  }
}

const onGlobalLinkClick = (targetTopic, targetSubtopic, linkElement) => {
  return (e) => {
    e.preventDefault();

    if (e.altKey) {
      let pathArray = pathForSectionElement(sectionElementOfLink(linkElement))

      if (linkElement.classList.contains('canopy-open-link')) {
        return updateView(
          pathArray,
        );
      } else {
        pathArray.push([
          linkElement.dataset.targetTopic,
          linkElement.dataset.targetSubtopic
        ]);

        return updateView(
          pathArray,
        );
      }
    } else {
      updateView(
        [[targetTopic, targetSubtopic]]
      );
    }
  }
}

export { onParentLinkClick, onGlobalLinkClick };
