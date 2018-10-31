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
  return document.querySelector('.canopy-selected-section')
}

const selectedLink = () => {
  return document.querySelector('.canopy-selected-link')
}

const currentRootSection = () => {
  return document.querySelector('.canopy-current-root-section');
}

const parentLinkOfSectionElement = (sectionElement) => {
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

function mostRecentlySelectedLinkOfSection(sectionElement) {
  return sectionElement.
    getElementsByClassName('canopy-most-recently-selected-link-of-section')[0];
}

export {
  canopyContainer,
  defaultTopic,
  sectionElementOfTopic,
  currentSection,
  currentRootSection,
  selectedLink,
  parentLinkOfSectionElement,
  childSectionElementOfParentLink,
  sectionElementOfLink,
  mostRecentlySelectedLinkOfSection
};
