import { defaultTopic, canopyContainer } from 'helpers/getters';
import { slugFor } from 'helpers/identifiers';

function pathOrDefaultTopic() {
  let pathArray = parsePathString();
  if (pathArray.length > 0) {
    return pathArray
  } else {
    return [[defaultTopic, defaultTopic]];
  }
}

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

const parsePathString = (pathStringArg) => {
  let pathString = pathStringArg || window.location.pathname + window.location.hash;

  let slashSeparatedUnits = pathString.
    replace(/_/g, ' ').
    split('/').
    filter((string) => string !== '');

  slashSeparatedUnits = fixAccidentalSeparationofTopicAndSubtopic(pathString, slashSeparatedUnits);

  return slashSeparatedUnits.map((slashSeparatedUnit) => {
    let match = slashSeparatedUnit.match(/([^#]*)(?:#([^#]*))?/);
    return [
      match[1] || match[2] || null,
      match[2] || match[1] || null,
    ];
  }).filter((tuple) => tuple[0] !== null);
}

function fixAccidentalSeparationofTopicAndSubtopic(pathString, slashSeparatedUnits) {
  // eg /Topic/#Subtopic/A#B  -> /Topic#Subtopic/A#B
  if (pathString.match(/\/#\w+/)) {
    for (let i = 1; i < slashSeparatedUnits.length; i++) {
      if (slashSeparatedUnits[i].match(/^#/)) {
        if (!slashSeparatedUnits[i - 1].match(/#/)) { // eg /Topic/#Subtopic -> /Topic#Subtopic
          let newItem = slashSeparatedUnits[i - 1] + slashSeparatedUnits[i];
          let newArray = slashSeparatedUnits.slice(0, i - 1).
            concat([newItem]).
            concat(slashSeparatedUnits.slice(i + 1));
          return newArray;
        } else { // eg /Topic#Subtopic/#Subtopic2 -> /Topic#Subtopic/Subtopic2
          let newItem = slashSeparatedUnits[i].slice(1);
          let newArray = slashSeparatedUnits.slice(0, i).
            concat([newItem]).
            concat(slashSeparatedUnits.slice(i + 1));
          return newArray;
        }
      }
    }
  }

  return slashSeparatedUnits;
}

function pathStringFor(pathArray) {
  return '/' + pathArray.map((tuple) => {
    return slugFor(tuple[0]) +
      (tuple[1] && tuple[1] !== tuple[0] ? ('#' + slugFor(tuple[1])) : '')
  }).join('/');
}

export { pathOrDefaultTopic, pathForSectionElement, parsePathString, pathStringFor};
