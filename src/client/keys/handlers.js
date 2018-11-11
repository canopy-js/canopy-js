import { currentSection, selectedLink, currentRootSection, linkNumberOf, sectionElementOfLink } from 'helpers/getters';
import {
  parentLinkOf,
  firstLinkOfSection,
  linkAfter,
  linkBefore,
  firstSiblingOf,
  lastSiblingOf,
  firstChildLinkOfParentLink
} from 'helpers/relationships';
import renderTopic from 'render/render_topic';
import setPathAndFragment from 'helpers/set_path_and_fragment';
import displayPath from 'display/display_path';

function moveUpward() {
  // TODO: If root, unselect link
  var linkElement = parentLinkOf(selectedLink()) ||
    firstLinkOfSection(currentRootSection());

    displayPath(
      linkElement.dataset.enclosingTopic,
      linkElement.dataset.urlSubtopic,
      linkElement
    );
}

function moveDownward(cycle) {
  // TODO handle redundant parent links
  var linkElement =
    firstChildLinkOfParentLink(selectedLink()) ||
    (cycle ? linkAfter(selectedLink()) : null) ||
    (cycle ? firstSiblingOf(selectedLink()) : null) ||
    selectedLink();

  displayPath(
    linkElement.dataset.enclosingTopic,
    linkElement.dataset.urlSubtopic,
    linkElement
  );
}

function moveLeftward() {
  var linkElement = linkBefore(selectedLink()) || lastSiblingOf(selectedLink());

  displayPath(
    linkElement.dataset.enclosingTopic,
    linkElement.dataset.urlSubtopic,
    linkElement
  );
}

function moveRightward() {
  var linkElement = linkAfter(selectedLink()) || firstSiblingOf(selectedLink());

  displayPath(
    linkElement.dataset.enclosingTopic,
    linkElement.dataset.urlSubtopic,
    linkElement
  );
}

function moveDownOrRedirect() {
  if (selectedLink().classList.contains('canopy-parent-link')) {
    moveDownward(false);
  } else if (selectedLink().classList.contains('canopy-global-link')) {
    renderTopic(
      selectedLink().dataset.targetTopic,
      selectedLink().dataset.targetSubtopic,
      null,
      true
    );
  } else if (selectedLink().classList.contains('canopy-redundant-parent-link')) {
    renderTopic(
      selectedLink().dataset.targetTopic,
      selectedLink().dataset.targetSubtopic
    );
  }
}

function paintGlobalLinks() {
  Array.from(document.getElementsByClassName('canopy-global-link')).forEach((el) => {
    el.classList.add('canopy-painted-global-link');
  });
}

function unpaintGlobalLinks() {
  Array.from(document.getElementsByClassName('canopy-global-link')).forEach((el) => {
    el.classList.remove('canopy-painted-global-link');
  });
}

export {
  moveUpward,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect,
  paintGlobalLinks,
  unpaintGlobalLinks
};
