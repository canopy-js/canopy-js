import { currentSection, selectedLink, currentRootSection } from 'helpers/getters';
import {
  parentLinkOf,
  firstLinkOfSection,
  linkAfter,
  linkBefore,
  firstSiblingOf,
  lastSiblingOf,
  firstChildLinkOf,
} from 'keys/relationships';
import displaySelectedLink from 'display/display_selected_link';
import renderTopic from 'render/render_topic';

function moveUpward() {
  var link = parentLinkOf(selectedLink()) ||
    firstLinkOfSection(currentRootSection());

  displaySelectedLink(link);
}

function moveDownward(cycle) {
  var link =
    firstChildLinkOf(selectedLink()) ||
    linkAfter(selectedLink()) ||
    (cycle ? firstSiblingOf(selectedLink()) : null) ||
    selectedLink();

  displaySelectedLink(link);
}

function moveLeftward() {
  var link = linkBefore(selectedLink()) || lastSiblingOf(selectedLink());

  displaySelectedLink(link);
}

function moveRightward() {
  var link = linkAfter(selectedLink()) || firstSiblingOf(selectedLink());
  displaySelectedLink(link);
}

function moveDownOrRedirect() {
  if (selectedLink().classList.contains('canopy-parent-link')) {
    moveDownward(false);
  } else if (selectedLink().classList.contains('canopy-alias-link')) {
    renderTopic(
      selectedLink().dataset.topicName,
      selectedLink().dataset.subtopicName,
      true
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
