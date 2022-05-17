import { defaultTopic, canopyContainer, projectPathPrefix } from 'helpers/getters';
import parsePathString from 'path/parse_path_string';

function pathOrDefaultTopic() {
  let pathArray = parsePathString();
  if (pathArray.length > 0) {
    return pathArray
  } else {
    return [[defaultTopic, defaultTopic]];
  }
}

function pathArrayForSectionElement(sectionElement) {
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

export { pathOrDefaultTopic, pathArrayForSectionElement };
