import { defaultTopic, canopyContainer, projectPathPrefix } from 'helpers/getters';
import Path from 'models/path';

function pathForSectionElement(sectionElement) {
  if (!sectionElement) { return null; }

  let pathArray = [];
  let currentElement = sectionElement;

  while (currentElement !== canopyContainer) {
    let currentTopic = currentElement.dataset.topicName;

    pathArray.unshift([
      currentTopic,
      currentElement.dataset.subtopicName
    ]);

    while (currentElement.dataset.topicName === currentTopic) {
      currentElement = currentElement.parentNode;
    }
  }

  return new Path(pathArray);
}

export { pathForSectionElement };
