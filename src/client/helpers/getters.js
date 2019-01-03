import { slugFor } from 'helpers/identifiers';

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

  let paragraphElement = paragraphElementOfSection(sectionElement.parentNode);

  return Array.
    from(paragraphElement.childNodes).
    find((linkElement) =>
      linkElement.tagName === 'A' &&
      linkElement.dataset.targetTopic === sectionElement.dataset.topicName &&
      linkElement.dataset.targetSubtopic === sectionElement.dataset.subtopicName);
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

function uniqueSubtopic(topicName, subtopicName) {
  return subtopicName && subtopicName !== topicName;
}

function documentTitleFor(topicName) {
  return topicName;// + ((subtopicName && subtopicName !== topicName) ? `: ${subtopicName}` : '');
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
  let paragraphElement = paragraphElementOfSection(sectionElement);

  return Array.
    from(paragraphElement.childNodes).
    find((linkElement) =>
      linkElement.tagName === 'A' &&
      linkElement.classList.contains('canopy-open-link'));
}

function paragraphElementOfSection(sectionElement) {
  return Array.from(
    sectionElement.
    childNodes
  ).find((element) => element.tagName === 'P')
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
  linkNumberOf,
  linkOfNumber,
  metadataFromLink,
  uniqueSubtopic,
  documentTitleFor,
  findLinkFromMetadata,
  findLowestExtantSectionElementOfPath,
  openLinkOfSection
};
