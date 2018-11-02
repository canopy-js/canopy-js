import { currentSection, selectedLink, currentRootSection, linkNumberOf, sectionElementOfLink } from 'helpers/getters';
import {
  parentLinkOf,
  firstLinkOfSection,
  linkAfter,
  linkBefore,
  firstSiblingOf,
  lastSiblingOf,
  firstChildLinkOf
} from 'keys/relationships';
import displaySelectedLink from 'display/display_selected_link';
import renderTopic from 'render/render_topic';
import setPathAndFragment from 'helpers/set_path_and_fragment';

function moveUpward() {
  var linkElement = parentLinkOf(selectedLink()) ||
    firstLinkOfSection(currentRootSection());

  if (linkElement.dataset.type === "parent") {
    setPathAndFragment(
      linkElement.dataset.childTopicName,
      linkElement.dataset.childSubtopicName,
      true,
      linkNumberOf(linkElement)
    );
  } else {
    setPathAndFragment(
      sectionElementOfLink(linkElement,).dataset.topicName,
      sectionElementOfLink(linkElement).dataset.subtopicName,
      false,
      linkNumberOf(linkElement)
    );
  }
}

function moveDownward(cycle) {
  var linkElement =
    firstChildLinkOf(selectedLink()) ||
    (cycle ? linkAfter(selectedLink()) : null) ||
    (cycle ? firstSiblingOf(selectedLink()) : null) ||
    selectedLink();

  if (linkElement.dataset.type === "parent") {
    setPathAndFragment(
      linkElement.dataset.childTopicName,
      linkElement.dataset.childSubtopicName,
      true,
      linkNumberOf(linkElement)
    );
  } else {
    setPathAndFragment(
      sectionElementOfLink(linkElement).dataset.topicName,
      sectionElementOfLink(linkElement).dataset.subtopicName,
      false,
      linkNumberOf(linkElement)
    );
  }
}

function moveLeftward() {
  var linkElement = linkBefore(selectedLink()) || lastSiblingOf(selectedLink());

  if (linkElement.dataset.type === "parent") {
    setPathAndFragment(
      linkElement.dataset.childTopicName,
      linkElement.dataset.childSubtopicName,
      true,
      linkNumberOf(linkElement)
    );
  } else {
    setPathAndFragment(
      sectionElementOfLink(linkElement).dataset.topicName,
      sectionElementOfLink(linkElement).dataset.subtopicName,
      false,
      linkNumberOf(linkElement)
    );
  }
}

function moveRightward() {
  var linkElement = linkAfter(selectedLink()) || firstSiblingOf(selectedLink());

  if (linkElement.dataset.type === "parent") {
    setPathAndFragment(
      linkElement.dataset.childTopicName,
      linkElement.dataset.childSubtopicName,
      true,
      linkNumberOf(linkElement)
    );
  } else {
    setPathAndFragment(
      sectionElementOfLink(linkElement).dataset.topicName,
      sectionElementOfLink(linkElement).dataset.subtopicName,
      false,
      linkNumberOf(linkElement)
    );
  }
}

function moveDownOrRedirect() {
  if (selectedLink().classList.contains('canopy-parent-link')) {
    moveDownward(false);
  } else if (
    selectedLink().classList.contains('canopy-global-link') ||
    selectedLink().classList.contains('canopy-redundant-parent-link')
    ) {
    setPathAndFragment(
      selectedLink().dataset.topicName,
      selectedLink().dataset.subtopicName,
      false,
      0
    );
  }
}

export {
  moveUpward,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect
};
