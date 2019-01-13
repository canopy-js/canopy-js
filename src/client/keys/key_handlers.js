import {
  currentSection,
  selectedLink,
  currentRootSection,
  linkNumberOf,
  sectionElementOfLink,
  parentLinkOfSection,
  sectionElementOfPath,
  metadataFromLink,
  openLinkOfSection,
  canopyContainer,
  parentLinkOf,
  firstLinkOfSection,
  linkAfter,
  linkBefore,
  firstSiblingOf,
  lastSiblingOf,
  firstChildLinkOfParentLink,
  lastChildLinkOfParentLink,
  enclosingTopicSectionOfLink,
} from 'helpers/getters';
import {
  isTopicRootSection,
  isTreeRootSection,
} from 'helpers/booleans';
import pathForSectionElement from 'helpers/path_for_section_element';
import updateView from 'display/update_view';
import setPath from 'path/set_path';
import displayPath from 'display/display_path';
import parsePathString from 'path/parse_path_string';
import { deselectAllLinks } from 'display/reset_page';
import pathStringFor from 'path/path_string_for';

function moveUpward() {
  let linkElement = parentLinkOf(selectedLink()) ||
    firstLinkOfSection(currentRootSection());
  let pathArray = parsePathString();

  if (isTreeRootSection(sectionElementOfLink(selectedLink()))) {
    let sectionElement = sectionElementOfLink(selectedLink());
    pathArray = [[
      sectionElement.dataset.topicName,
      sectionElement.dataset.topicName
    ]];

    linkElement = null;
  } else if (isTopicRootSection(sectionElementOfLink(selectedLink()))) {
    pathArray.pop();

    let currentSectionElement = currentSection();
    let sectionElementOfSelectedLink = sectionElementOfLink(selectedLink());

    if (currentSectionElement !== sectionElementOfSelectedLink && selectedLink().classList.contains('canopy-global-link')) { //handle global link with inlined child with no links
      linkElement = selectedLink();
    }
  } else {
    let finalTuple = pathArray.pop();
    let newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.push(newTuple);
  }

  updateView(
    pathArray,
    metadataFromLink(linkElement)
  );
}

function moveDownward(cycle) {
  let pathArray = parsePathString();

  if (selectedLink().classList.contains('canopy-redundant-local-link')) {
    let finalTuple = pathArray.pop();
    let newTuple = [finalTuple[0], selectedLink().dataset.targetSubtopic];
    pathArray.push(newTuple);
    let linkElement = parentLinkOfSection(sectionElementOfPath(pathArray));

    displayPath(
      pathArray,
      linkElement
    );
  }

  let linkElement =
    firstChildLinkOfParentLink(selectedLink()) ||
    (cycle ? linkAfter(selectedLink()) : null) ||
    (cycle ? firstSiblingOf(selectedLink()) : null) ||
    selectedLink();

  if (selectedLink().classList.contains('canopy-global-link')) {
    if (selectedLink().classList.contains('canopy-open-link')) { return; }

    pathArray.push([
      selectedLink().dataset.targetTopic,
      selectedLink().dataset.targetSubtopic
    ]);

    return updateView(
      pathArray,
      null,
      true
    );
  } else {
    let finalTuple = pathArray.pop();
    let newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.push(newTuple);
  }

  displayPath(
    pathArray,
    linkElement
  );
}

function moveLeftward() {
  let currentSectionElement = currentSection();
  let sectionElementOfSelectedLink = sectionElementOfLink(selectedLink());

  let pathArray = parsePathString();

  if (selectedLink().classList.contains('canopy-global-link') && // handle left on inlined global with no child links
    currentSectionElement !== sectionElementOfSelectedLink) {
    pathArray.pop();
  }

  let linkElement = linkBefore(selectedLink()) || lastSiblingOf(selectedLink());

  let finalTuple = pathArray.pop();
  let newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.push(newTuple);

  displayPath(
    pathArray,
    linkElement
  );
}

function moveRightward() {
  let currentSectionElement = currentSection();
  let sectionElementOfSelectedLink = sectionElementOfLink(selectedLink());

  let linkElement = linkAfter(selectedLink()) || firstSiblingOf(selectedLink());

  let pathArray = parsePathString();

  if (selectedLink().classList.contains('canopy-global-link') && // handle left on inlined global with no child links
    currentSectionElement !== sectionElementOfSelectedLink) {
    pathArray.pop();
  }

  let finalTuple = pathArray.pop();
  let newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.push(newTuple);

  displayPath(
    pathArray,
    linkElement
  );
}

function moveDownOrRedirect(newTab) {
  if (selectedLink().classList.contains('canopy-local-link') ||
      selectedLink().classList.contains('canopy-redundant-local-link')) {
    moveDownward(false);
  } else if (selectedLink().classList.contains('canopy-global-link')) {
    let pathArray = [[
      selectedLink().dataset.targetTopic,
      selectedLink().dataset.targetSubtopic
    ]];

    if (newTab) {
      let pathString = pathStringFor(pathArray);
      return window.open(
        location.origin + pathString,
        '_blank'
      );
    }

    updateView(
      pathArray,
      null,
      true
    );
  }
}

function depthFirstSearch(forwardDirection, skipChildren) {
  let nextLink;
  let previouslySelectedLinkClassName = forwardDirection ?
    'canopy-dfs-previously-selected-link' :
    'canopy-reverse-dfs-previously-selected-link';
  let previouslySelectedLink =
    document.querySelector('.' + previouslySelectedLinkClassName);

  let lastChildToVisit = forwardDirection ?
    lastChildLinkOfParentLink(selectedLink()) :
    firstChildLinkOfParentLink(selectedLink());

  let firstChildToVisit = forwardDirection ?
    firstChildLinkOfParentLink(selectedLink()) :
    lastChildLinkOfParentLink(selectedLink());

  if ((!previouslySelectedLink || previouslySelectedLink !== lastChildToVisit) &&
    selectedLink().dataset.type !== 'global' &&
    !skipChildren
  ) {
    nextLink = firstChildToVisit;
  }

  let nextSiblingToVisit = forwardDirection ?
    linkAfter(selectedLink()) :
    linkBefore(selectedLink());

  if (!nextLink) {
    nextLink = nextSiblingToVisit;
  }

  let parentLink = parentLinkOfSection(sectionElementOfLink(selectedLink()));
  if (!nextLink && parentLink && parentLink.dataset.type !== 'global') {
    nextLink = parentLink;
  }

  // update previous link unless it didn't change
  if (nextLink) {
    if (previouslySelectedLink) {
      previouslySelectedLink.classList.remove(previouslySelectedLinkClassName);
    }
    selectedLink().classList.add(previouslySelectedLinkClassName);
  }

  if (!nextLink) {
    return;
  }

  updateView(
    pathForSectionElement(sectionElementOfLink(nextLink)),
    metadataFromLink(nextLink),
    null,
    null,
    forwardDirection
  );
}

function goToEnclosingTopic() {
  let sectionElement = enclosingTopicSectionOfLink(selectedLink());
  let linkElement = openLinkOfSection(sectionElement) || selectedLink();

  updateView(
    pathForSectionElement(sectionElement),
    metadataFromLink(linkElement)
  );
}

function goToParentOfEnclosingTopic() {
  let sectionElement = enclosingTopicSectionOfLink(selectedLink());
  if (sectionElement.parentNode !== canopyContainer) {
    sectionElement = sectionElement.parentNode;
  }
  let linkElement = openLinkOfSection(sectionElement);

  updateView(
    pathForSectionElement(sectionElement),
    metadataFromLink(linkElement)
  );
}

export {
  moveUpward,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect,
  depthFirstSearch,
  reverseDepthFirstSearch,
  goToEnclosingTopic,
  goToParentOfEnclosingTopic
};
