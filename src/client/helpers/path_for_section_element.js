import { canopyContainer } from 'helpers/getters';

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

  return pathArray;
}

export default pathForSectionElement;
