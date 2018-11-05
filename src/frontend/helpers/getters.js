import { slugFor } from 'helpers/identifiers';

const canopyContainer = document.getElementById('_canopy');
if(!canopyContainer) {
  throw new Error('Page must have an html element with id "_canopy"');
}

const defaultTopic = document.getElementById('_canopy').dataset.defaultTopic;
if(!defaultTopic) {
  throw new Error('HTML element with id "_canopy" must have a default topic data attribute');
}

const sectionElementOfTopic = (topicName, subtopicName) => {
  return document.querySelector('#_canopy #_canopy_' + slugFor(topicName) + '_' + slugFor(subtopicName));
}

const currentSection = () => {
  return document.querySelector('.canopy-selected-section');
}

const selectedLink = () => {
  return document.querySelector('.canopy-selected-link');
}

const currentRootSection = () => {
  return document.querySelector('.canopy-current-root-section');
}

const parentLinkOfSection = (sectionElement) => {
  return document.querySelector('#_canopy a.' + sectionElement.id);
}

const childSectionElementOfParentLink = (linkElement) => {
  return document.querySelector('#' + linkElement.dataset.childSectionId);
}

function sectionElementOfLink(linkElement) {
  if (linkElement === null) {
    return null;
  }

  return linkElement.parentNode.parentNode;
}

function uniqueSubtopic(topicName, subtopicName) {
  return subtopicName && subtopicName !== topicName;
}

function documentTitleFor(topicName, subtopicName) {
  return topicName + ((subtopicName && subtopicName !== topicName) ? `: ${subtopicName}` : '');
}

function metadataFromLink(linkElement) {
  if (!linkElement) { return {}; }

  var relativeLinkNumber = Array.from(document.querySelectorAll(
    '#' + sectionElementOfLink(linkElement).id +
    ` a[data-target-topic="${linkElement.dataset.targetTopic}"]` +
    `[data-target-subtopic="${linkElement.dataset.targetSubtopic}"]`
  )).indexOf(linkElement);

  return {
    sectionElementid: sectionElementOfLink(linkElement).id,
    targetTopic: linkElement.dataset.targetTopic,
    targetSubtopic: linkElement.dataset.targetSubtopic,
    relativeLinkNumber: relativeLinkNumber
  };
}

function findLinkFromMetadata(linkSelectionData) {
  return document.querySelectorAll(
    '#' + linkSelectionData.sectionElementid +
    ` a[data-target-topic="${linkSelectionData.targetTopic}"]` +
    `[data-target-subtopic="${linkSelectionData.targetSubtopic}"]`
  )[linkSelectionData.relativeLinkNumber];
}

export {
  canopyContainer,
  defaultTopic,
  sectionElementOfTopic,
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
  findLinkFromMetadata
};
