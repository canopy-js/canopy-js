import { currentRootSection, canopyContainer } from 'helpers/getters';
import { sectionElementOfLink } from 'helpers/getters';

function isInRootSection(linkElement) {
  return sectionElementOfLink(linkElement) === currentRootSection();
}

function isTopicRootSection(sectionElement) {
  return sectionElement.dataset.topicName === sectionElement.dataset.subtopicName;
}

function isTreeRootSection(sectionElement) {
  return sectionElement.parentNode === canopyContainer;
}

export {
  isInRootSection,
  isTopicRootSection,
  isTreeRootSection,
};
