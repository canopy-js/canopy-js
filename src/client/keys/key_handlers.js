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
  firstLinkOfSectionElement,
  linkAfter,
  linkBefore,
  firstSiblingOf,
  lastSiblingOf,
  firstChildLinkOfParentLink,
  lastChildLinkOfParentLink,
  enclosingTopicSectionOfLink,
  childSectionElementOfParentLink
} from 'helpers/getters';
import {
  isATopicRootSection,
  isTreeRootSection,
  sectionHasNoChildLinks
} from 'helpers/booleans';
import pathForSectionElement from 'path/path_for_section_element';
import updateView from 'display/update_view';
import setPath from 'path/set_path';
import displayPath from 'display/display_path';
import parsePathString from 'path/parse_path_string';
import { deselectAllLinks } from 'display/reset_page';
import pathStringFor from 'path/path_string_for';

function moveUpward() {
  let pathArray = parsePathString();
  let linkElement;

  if (isTreeRootSection(sectionElementOfLink(selectedLink()))) {
    let sectionElement = sectionElementOfLink(selectedLink());
    pathArray = [[
      sectionElement.dataset.topicName,
      sectionElement.dataset.topicName
    ]];

    linkElement = null;
  } else if (isATopicRootSection(sectionElementOfLink(selectedLink()))) {
    pathArray.pop();

    linkElement = parentLinkOf(selectedLink());
    let currentSectionElement = currentSection();
    let sectionElementOfSelectedLink = sectionElementOfLink(selectedLink());

    // Handle global link with inlined child with no links
    if (currentSectionElement !== sectionElementOfSelectedLink &&
      selectedLink().dataset.type === 'global') {
      linkElement = selectedLink();
    }
  } else {
    linkElement = parentLinkOf(selectedLink());
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

  if (selectedLink().dataset.type === 'global') {
    // Handle open global link with no children
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
  }

  if (selectedLink().dataset.type === 'local') {
    let linkElement =
      firstChildLinkOfParentLink(selectedLink()) ||
      selectedLink();

    let finalTuple = pathArray.pop();
    let newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.push(newTuple);

    return updateView(
      pathArray,
      metadataFromLink(linkElement)
    );
  }

  if (selectedLink().dataset.type ==='redundant-local') {
    let finalTuple = pathArray.pop();
    let newTuple = [finalTuple[0], selectedLink().dataset.targetSubtopic];
    pathArray.push(newTuple);
    let linkElement = firstLinkOfSectionElement(sectionElementOfPath(pathArray));

    return updateView(
      pathArray,
      metadataFromLink(linkElement)
    );
  }
}

function moveLeftward() {
  let currentSectionElement = currentSection();
  let sectionElementOfSelectedLink = sectionElementOfLink(selectedLink());
  let pathArray = parsePathString();

  // handle left on inlined global with no child links
  if (selectedLink().dataset.type === 'global' &&
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
  let pathArray = parsePathString();

  // handle left on inlined global with no child links
  if (selectedLink().dataset.type === 'global' &&
    currentSectionElement !== sectionElementOfSelectedLink) {
    pathArray.pop();
  }

  let linkElement = linkAfter(selectedLink()) || firstSiblingOf(selectedLink());
  let finalTuple = pathArray.pop();
  let newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.push(newTuple);

  displayPath(
    pathArray,
    linkElement
  );
}

function moveDownOrRedirect(newTab) {
  if (selectedLink().dataset.type === 'local' ||
      selectedLink().dataset.type === 'redundant-parent') {
    return moveDownward(false);
  } else if (selectedLink().dataset.type === 'global') {
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

function depthFirstSearch(direction, enterGlobalLinks) {
  let nextLink;
  let previouslySelectedLinkClassName = direction === 1 ?
    'canopy-dfs-previously-selected-link' :
    'canopy-reverse-dfs-previously-selected-link';
  let previouslySelectedLink = document.querySelector('.' + previouslySelectedLinkClassName);
  let nextPreviouslySelectedLink;

  // Enter a global link
  if (
    selectedLink().dataset.type === 'global' &&
    enterGlobalLinks &&
    previouslySelectedLink !== selectedLink()
  ) {
    let targetTopic = selectedLink().dataset.targetTopic;
    let pathToCurrentLink = pathForSectionElement(sectionElementOfLink(selectedLink()));
    let newPathArray = pathToCurrentLink.concat([[targetTopic, targetTopic]]);
    let sectionElement = sectionElementOfPath(newPathArray);

    if (!sectionElement || !openLinkOfSection(sectionElement)) {
      if (previouslySelectedLink) {
        previouslySelectedLink.classList.remove(previouslySelectedLinkClassName);
      }
      selectedLink().classList.add(previouslySelectedLinkClassName);

      return updateView(
        newPathArray,
        null,
        true,
        null,
        direction
      );
    }
  }

  // Close a global link with no children so selection never changes
  if (
    selectedLink().dataset.type === 'global' &&
    sectionHasNoChildLinks(childSectionElementOfParentLink(selectedLink())) &&
    selectedLink().classList.contains('canopy-open-link')
  ) {
    if (previouslySelectedLink) {
      previouslySelectedLink.classList.remove(previouslySelectedLinkClassName);
    }
    selectedLink().classList.add(previouslySelectedLinkClassName);

    return updateView(
      parsePathString().slice(0, -1),
      metadataFromLink(selectedLink()),
      false,
      null,
      direction
    );
  }

  // Enter a parent link
  let lastChildToVisit = direction === 1 ?
    lastChildLinkOfParentLink(selectedLink()) :
    firstChildLinkOfParentLink(selectedLink());

  let firstChildToVisit = direction === 1 ?
    firstChildLinkOfParentLink(selectedLink()) :
    lastChildLinkOfParentLink(selectedLink());

  if (
    (!previouslySelectedLink || previouslySelectedLink !== lastChildToVisit) &&
    selectedLink().dataset.type !== 'global' &&
    selectedLink().dataset.type !== 'redundant-local'
  ) {
    nextLink = firstChildToVisit;
  }

  // Move to the next sibling
  let nextSiblingToVisit = direction === 1 ?
    linkAfter(selectedLink()) :
    linkBefore(selectedLink());

  if (!nextLink) {
    nextLink = nextSiblingToVisit;
  }

  // Move to parent
  let parentLink = parentLinkOfSection(sectionElementOfLink(selectedLink()));
  if (!nextLink && parentLink && parentLink.dataset.type !== 'global') {
    nextLink = parentLink;
  }

  // Move to parent link that is a global link
  let globalParentLink = parentLinkOfSection(sectionElementOfLink(selectedLink()));

  if (!nextLink && parentLink.dataset.type === 'global' && enterGlobalLinks) {
    nextLink = globalParentLink;
    nextPreviouslySelectedLink = parentLink;
  }


  // Do nothing
  if (!nextLink) {
    return;
  }

  // Update "previous link"
  if (previouslySelectedLink) {
    previouslySelectedLink.classList.remove(previouslySelectedLinkClassName);
  }
  (nextPreviouslySelectedLink || selectedLink()).classList.add(previouslySelectedLinkClassName);

  // Update the view
  updateView(
    pathForSectionElement(sectionElementOfLink(nextLink)),
    metadataFromLink(nextLink),
    null,
    null,
    direction
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
