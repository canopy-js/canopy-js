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
  var currentNode = canopyContainer;

  for (var i = 0; i < pathArray.length; i++) {
    if (!currentNode) { return null; }

    var topicName = pathArray[i][0];
    var subtopicName = pathArray[i][1];

    currentNode = currentNode.querySelector(
      `[data-topic-name="${topicName}"]` +
      `[data-subtopic-name="${subtopicName}"]` +
      `[data-path-depth="${i}"]`
    );
  }

  return currentNode;
}

const currentSection = () => {
  var nodeList = document.querySelectorAll('section[style="display: block;"');
  return nodeList[nodeList.length - 1];
}

const selectedLink = () => {
  return document.querySelector('.canopy-selected-link[style="display: block;"');
}

const currentRootSection = () => {
  var nodeList = document.querySelectorAll('section[style="display: block;"');
  return nodeList[0];
}

const parentLinkOfSection = (sectionElement) => {
  if (sectionElement.parentNode === canopyContainer) { return null; }

  var paragraphElement = Array.from(
      sectionElement.
      parentNode.
      childNodes
    ).find((element) => element.tagName === 'P')

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
  if (!linkElement) { return {}; }

  var sectionElement = sectionElementOfLink(linkElement);

  var relativeLinkNumber = Array.from(
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
  var lowestExtantSectionElementOfPath = null;
  var pathSuffixToRender = [];

  for (var i = 0; i < pathArray.length; i++) {
    var pathSegment = pathArray.slice(0, i + 1);
    var sectionElement = sectionElementOfPath(pathSegment);
    if (sectionElement) {
      lowestExtantSectionElementOfPath = sectionElementOfPath(pathSegment);
    } else {
      pathSuffixToRender = pathArray.slice(i);
      break;
    }
  }

  return { lowestExtantSectionElementOfPath, pathSuffixToRender };
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
  findLowestExtantSectionElementOfPath
};
