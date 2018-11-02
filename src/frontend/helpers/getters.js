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

function linkNumberOf(linkElement) {
  if (!linkElement) { return null; }

  var linkNumber = Array.from(
    linkElement.parentNode.querySelectorAll('a')
  ).indexOf(linkElement);

  if (linkNumber === -1) {
    return null;
  } else {
    return linkNumber;
  }
}

function linkOfNumber(number, sectionElement) {
  if (typeof number !== 'number' || !sectionElement) { return null; }

  return sectionElement.querySelectorAll('a')[number];
}

function currentLinkNumberAndLinkTypeAsObject() {
  return {
    selectedLinkNumber: linkNumberOf(selectedLink()),
    selectedLinkInParentSection: selectedLink() && selectedLink().dataset.type === 'parent'
  };
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
  currentLinkNumberAndLinkTypeAsObject
};
