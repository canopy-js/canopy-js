import { selectedLink, currentRootSection, canopyContainer } from 'helpers/getters';
import {
  childSectionElementOfParentLink,
  parentLinkOfSection,
  sectionElementOfLink
} from 'helpers/getters';

function firstSiblingOf(linkElement) {
  if (linkElement === null){
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');
  return links[0] || linkElement;
}

function lastSiblingOf(linkElement) {
  if (linkElement === null){
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');
  return links[links.length - 1] || null;
}

function parentLinkOf(linkElement) {
  if (linkElement === null) {
    return null;
  }

  if (isInRootSection(linkElement)) {
    return null;
  }

  return parentLinkOfSection(sectionElementOfLink(linkElement));
}

function isInRootSection(linkElement) {
  return sectionElementOfLink(linkElement) === currentRootSection();
}

function linkAfter(linkElement) {
  if (linkElement === null) {
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');
  if (linkElement !== links[links.length - 1]){
    return links[
      Array.prototype.slice.call(links).indexOf(linkElement) + 1
    ];
  } else {
    return null;
  }
}

function linkBefore(linkElement) {
  if (linkElement === null) {
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');
  if (linkElement !== links[0]){
    return links[
      Array.prototype.slice.call(links).indexOf(linkElement) - 1
    ];
  } else {
    return null;
  }
}

function firstChildLinkOfParentLink(linkElement) {
  if (linkElement === null){
    return null;
  }

  var sectionElement = childSectionElementOfParentLink(linkElement);
  if (!sectionElement) { return null; }

  return sectionElement.querySelectorAll('a')[0];
}

function firstLinkOfSection(sectionElement) {
  if (sectionElement === null){
    return null;
  }

  return sectionElement.querySelectorAll('a')[0] || null;
}

function isTopicRootSection(sectionElement) {
  return sectionElement.dataset.topicName === sectionElement.dataset.subtopicName;
}

function isTreeRootSection(sectionElement) {
  return sectionElement.parentNode === canopyContainer;
}

function pathForSectionElement(sectionElement) {
  var pathArray = [];
  var currentElement = sectionElement;

  while (currentElement !== canopyContainer) {
    var currentTopic = currentElement.dataset.topicName;

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

export {
  firstSiblingOf,
  lastSiblingOf,
  leftwardLink,
  rightwardLink,
  linkAfter,
  linkBefore,
  upwardLink,
  downwardLink,
  parentLinkOf,
  firstLinkOfSection,
  firstChildLinkOfParentLink,
  isTopicRootSection,
  isTreeRootSection,
  pathForSectionElement
};
