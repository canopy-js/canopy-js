import { currentRootSection, canopyContainer } from 'helpers/getters';
import { sectionElementContainingLink, linksOfSectionElement, sectionElementOfPath } from 'helpers/getters';

function isInRootSection(linkElement) {
  return sectionElementContainingLink(linkElement) === currentRootSection();
}

function isATopicRootSection(sectionElement) {
  return sectionElement.dataset.topicName === sectionElement.dataset.subtopicName;
}

function isPageRootSection(sectionElement) {
  return sectionElement.parentNode === canopyContainer;
}

function sectionHasNoChildLinks(sectionElement) {
  if (!sectionElement) {
    return null;
  }
  return linksOfSectionElement(sectionElement).length === 0;
}

export {
  isInRootSection,
  isATopicRootSection,
  isPageRootSection,
  sectionHasNoChildLinks
};
