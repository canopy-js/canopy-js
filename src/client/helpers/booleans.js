import { currentRootSection, canopyContainer } from 'helpers/getters';
import { sectionElementOfLink } from 'helpers/getters';

function isInRootSection(linkElement) {
  return sectionElementOfLink(linkElement) === currentRootSection();
}

function isATopicRootSection(sectionElement) {
  return sectionElement.dataset.topicName === sectionElement.dataset.subtopicName;
}

function isTreeRootSection(sectionElement) {
  return sectionElement.parentNode === canopyContainer;
}

export {
  isInRootSection,
  isATopicRootSection,
  isTreeRootSection,
};
