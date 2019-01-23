import { slugFor } from 'helpers/identifiers';
import { isInRootSection } from 'helpers/booleans';

const canopyContainer = document.getElementById('_canopy');
if(!canopyContainer) {
  throw new Error('Page must have an html element with id "_canopy"');
}

const defaultTopic = document.getElementById('_canopy').dataset.defaultTopic;
if(!defaultTopic) {
  throw new Error('HTML element with id "_canopy" must have a default topic data attribute');
}

const sectionElementOfPath = (pathArray) => {
  let currentNode = canopyContainer;

  for (let i = 0; i < pathArray.length; i++) {
    if (!currentNode) { return null; }

    let topicName = pathArray[i][0];
    let subtopicName = pathArray[i][1];

    currentNode = currentNode.querySelector(
      `[data-topic-name="${topicName}"]` +
      `[data-subtopic-name="${subtopicName}"]` +
      `[data-path-depth="${i}"]`
    );
  }

  return currentNode;
}

const currentSection = () => {
  let nodeList = document.querySelectorAll('section[style="display: block;"');
  return nodeList[nodeList.length - 1];
}

const selectedLink = () => {
  return document.querySelector('.canopy-selected-link');
}

const currentRootSection = () => {
  let nodeList = document.querySelectorAll('section[style="display: block;"');
  return nodeList[0];
}

const parentLinkOfSection = (sectionElement) => {
  if (sectionElement.parentNode === canopyContainer) { return null; }

  return linkOfSectionByTarget(
    sectionElement.parentNode,
    sectionElement.dataset.topicName,
    sectionElement.dataset.subtopicName
  );
}

const childSectionElementOfParentLink = (linkElement) => {
  return Array.from(linkElement.
    parentNode.
    parentNode.
    childNodes).
    find((sectionElement) =>
      sectionElement.dataset.topicName === linkElement.dataset.targetTopic &&
      sectionElement.dataset.subtopicName === linkElement.dataset.targetSubtopic);
}

function sectionElementOfLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  return linkElement.parentNode.parentNode;
}

function documentTitleFor(topicName) {
  return topicName;
}

function metadataFromLink(linkElement) {
  if (!linkElement) { return null; }

  let sectionElement = sectionElementOfLink(linkElement);

  let relativeLinkNumber = Array.from(
    sectionElement.querySelectorAll(
    ` a[data-target-topic="${linkElement.dataset.targetTopic}"]` +
    `[data-target-subtopic="${linkElement.dataset.targetSubtopic}"]`
  )).indexOf(linkElement);

  return {
    sectionElementTopicName: sectionElement.dataset.topicName,
    sectionElementSubtopicName: sectionElement.dataset.subtopicName,
    sectionElementPathDepth: sectionElement.dataset.pathDepth,
    targetTopic: linkElement.dataset.targetTopic,
    targetSubtopic: linkElement.dataset.targetSubtopic,
    relativeLinkNumber: relativeLinkNumber
  };
}

function findLinkFromMetadata(linkSelectionData) {
  return document.querySelectorAll(
    `section[data-topic-name="${linkSelectionData.sectionElementTopicName}"]` +
    `[data-subtopic-name="${linkSelectionData.sectionElementSubtopicName}"]` +
    `[data-path-depth="${linkSelectionData.sectionElementPathDepth}"]` +
    ` a[data-target-topic="${linkSelectionData.targetTopic}"]` +
    `[data-target-subtopic="${linkSelectionData.targetSubtopic}"]`
  )[linkSelectionData.relativeLinkNumber];
}

function findLowestExtantSectionElementOfPath(pathArray) {
  let lowestExtantSectionElementOfPath = null;
  let pathSuffixToRender = [];

  for (let i = 0; i < pathArray.length; i++) {
    let pathSegment = pathArray.slice(0, i + 1);
    let sectionElement = sectionElementOfPath(pathSegment);
    if (sectionElement) {
      lowestExtantSectionElementOfPath = sectionElementOfPath(pathSegment);
    } else {
      pathSuffixToRender = pathArray.slice(i);
      break;
    }
  }

  return { lowestExtantSectionElementOfPath, pathSuffixToRender };
}

function openLinkOfSection(sectionElement) {
  return linkOfSectionLike(
    sectionElement,
    (linkElement) => linkElement.classList.contains('canopy-open-link')
  );
}

function paragraphElementOfSection(sectionElement) {
  return Array.from(
    sectionElement.
    childNodes
  ).find((element) => element.tagName === 'P')
}

function linkAfter(linkElement) {
  if (linkElement === null) {
    return null;
  }

  let links = linkElement.parentNode.querySelectorAll('a');
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

  let links = linkElement.parentNode.querySelectorAll('a');
  if (linkElement !== links[0]){
    return links[
      Array.prototype.slice.call(links).indexOf(linkElement) - 1
    ];
  } else {
    return null;
  }
}

function firstOrLastChildOfParentLink(linkElement, first) {
  if (linkElement === null) {
    return null;
  }

  let sectionElement = childSectionElementOfParentLink(linkElement);
  if (!sectionElement) { return null; }

  let array = Array.from(sectionElement.firstElementChild.childNodes).filter((node) => node.tagName === 'A');

  if (first) {
    return array[0];
  } else {
    return array[array.length - 1];
  }
}

function firstChildLinkOfParentLink(linkElement) {
  return firstOrLastChildOfParentLink(linkElement, true);
}

function lastChildLinkOfParentLink(linkElement) {
  return firstOrLastChildOfParentLink(linkElement, false);
}

function linksOfParagraph(paragraphElement) {
  return Array.
    from(paragraphElement.childNodes).
    filter((linkElement) => linkElement.tagName === 'A');
}

function firstLinkOfSection(sectionElement) {
  if (sectionElement === null){
    return null;
  }
  let paragraphElement = paragraphElementOfSection(sectionElement);
  return linksOfParagraph(paragraphElement)[0] || null;
}

function enclosingTopicSectionOfLink(linkElement) {
  let sectionElement = sectionElementOfLink(linkElement);

  if (sectionElement.dataset.pathDepth === "0") {
    return currentRootSection();
  }

  let currentSectionElement = sectionElement;

  while (currentSectionElement.parentNode.dataset.pathDepth === sectionElement.dataset.pathDepth) {
    currentSectionElement = currentSectionElement.parentNode;
  }

  return currentSectionElement;
}

function firstSiblingOf(linkElement) {
  if (linkElement === null){
    return null;
  }

  let links = linkElement.parentNode.querySelectorAll('a');
  return links[0] || linkElement;
}

function lastSiblingOf(linkElement) {
  if (linkElement === null){
    return null;
  }

  let links = linkElement.parentNode.querySelectorAll('a');
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

function siblingOfLinkLike(linkElementArg, condition) {
  return Array.from(linkElementArg.parentNode.childNodes).find((linkElement) => {
      return condition(linkElement) &&
        linkElement !== linkElementArg;
    });
}

function linkOfSectionLike(sectionElement, condition) {
  let paragraphElement = paragraphElementOfSection(sectionElement);
  return linksOfParagraph(paragraphElement).find(condition);
}

function linkOfSectionByTarget(sectionElement, topicName, subtopicName) {
  return linkOfSectionLike(sectionElement, (linkElement) =>
    linkElement.dataset.targetTopic === topicName &&
    linkElement.dataset.targetSubtopic === subtopicName
  )
}

export {
  canopyContainer,
  defaultTopic,
  sectionElementOfPath,
  currentSection,
  currentRootSection,
  selectedLink,
  parentLinkOfSection,
  childSectionElementOfParentLink,
  sectionElementOfLink,
  metadataFromLink,
  documentTitleFor,
  findLinkFromMetadata,
  findLowestExtantSectionElementOfPath,
  openLinkOfSection,
  paragraphElementOfSection,
  linkAfter,
  linkBefore,
  firstChildLinkOfParentLink,
  lastChildLinkOfParentLink,
  firstLinkOfSection,
  enclosingTopicSectionOfLink,
  firstSiblingOf,
  lastSiblingOf,
  parentLinkOf,
  siblingOfLinkLike,
  linkOfSectionLike,
  linkOfSectionByTarget,
};
