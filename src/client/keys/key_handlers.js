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
  lastLinkOfSectionElement,
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
  isPageRootSection,
  sectionHasNoChildLinks
} from 'helpers/booleans';
import { pathForSectionElement } from 'path/helpers';
import updateView from 'display/update_view';
import setPath from 'path/set_path';
import displayPath from 'display/display_path';
import { parsePathString } from 'path/helpers';
import { deselectAllLinks } from 'display/helpers';
import pathStringFor from 'path/path_string_for';

function moveUpward() {
  let pathArray = parsePathString();
  let linkElement;

  if (selectedLinkIsOpenGlobalLink()) {
    // Handle global link with inlined child with no links
    pathArray.pop();
    linkElement = selectedLink();
  } else if (isPageRootSection(sectionElementOfLink(selectedLink()))) {
    let sectionElement = sectionElementOfLink(selectedLink());
    pathArray = [[
      sectionElement.dataset.topicName,
      sectionElement.dataset.topicName
    ]];

    linkElement = null;
  } else if (isATopicRootSection(sectionElementOfLink(selectedLink()))) {
    pathArray.pop();
    linkElement = parentLinkOf(selectedLink());
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

function selectedLinkIsOpenGlobalLink() {
  let currentSectionElement = currentSection();
  let sectionElementOfSelectedLink = sectionElementOfLink(selectedLink());

  return currentSectionElement !== sectionElementOfSelectedLink &&
      selectedLink().dataset.type === 'global'
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

  if (selectedLink().dataset.type === 'redundant-local') {
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

  // handle left on opened global link with no child links
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

  // handle right on opened global link with no child links
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
  } else if (selectedLink().dataset.type === 'url') {
    if (newTab) {
      return window.open(
        selectedLink().href,
        '_blank'
      );
    } else {
      window.location = selectedLink().href;
    }
  }
}

function depthFirstSearch(dfsDirectionInteger, enterGlobalLinks, closeGlobalLinks) {
  let previouslySelectedLinkClassName = dfsDirectionInteger === 1 ?
    'canopy-dfs-previously-selected-link' :
    'canopy-reverse-dfs-previously-selected-link';
  let previouslySelectedLink = document.querySelector('.' + previouslySelectedLinkClassName);

  // Enter a global link
  let lastChildLink = dfsDirectionInteger === 1 ?
    lastLinkOfSectionElement(childSectionElementOfParentLink(selectedLink())) :
    firstLinkOfSectionElement(childSectionElementOfParentLink(selectedLink()));
  let targetTopic = selectedLink().dataset.targetTopic;
  let pathToCurrentLink = pathForSectionElement(sectionElementOfLink(selectedLink()));
  let newPathArray = pathToCurrentLink.concat([[targetTopic, targetTopic]]);
  let sectionElement = sectionElementOfPath(pathToCurrentLink);
  let alreadyVisitedGlobalLinkIfChildren = !lastChildLink || !previouslySelectedLink || previouslySelectedLink !== lastChildLink;
  let alreadyVisitedGlobalLinkIfNoChildren = previouslySelectedLink !== selectedLink();
  let alreadyVisitedGlobalLink = alreadyVisitedGlobalLinkIfChildren && alreadyVisitedGlobalLinkIfNoChildren;
  let childSectionIsNotAlreadyVisible = !sectionElement || !openLinkOfSection(sectionElement);

  if (
    selectedLink().dataset.type === 'global' &&
    enterGlobalLinks &&
    (alreadyVisitedGlobalLink) &&
    (childSectionIsNotAlreadyVisible)
  ) {
    return updateView(
      newPathArray,
      null,
      true,
      null,
      dfsDirectionInteger
    );
  }

  // Close a global link with no children
  if (
    selectedLink().dataset.type === 'global' &&
    closeGlobalLinks &&
    sectionHasNoChildLinks(childSectionElementOfParentLink(selectedLink())) &&
    selectedLink().classList.contains('canopy-open-link')
  ) {
    return updateView(
      parsePathString().slice(0, -1),
      metadataFromLink(selectedLink()),
      false,
      null,
      dfsDirectionInteger
    );
  }

  // Enter a parent link
  let lastChildToVisit = dfsDirectionInteger === 1 ?
    lastChildLinkOfParentLink(selectedLink()) :
    firstChildLinkOfParentLink(selectedLink());

  let firstChildToVisit = dfsDirectionInteger === 1 ?
    firstChildLinkOfParentLink(selectedLink()) :
    lastChildLinkOfParentLink(selectedLink());

  if (
    firstChildToVisit &&
    (!previouslySelectedLink || previouslySelectedLink !== lastChildToVisit) &&
    selectedLink().dataset.type !== 'global' &&
    selectedLink().dataset.type !== 'redundant-local'
  ) {
    let nextLink = firstChildToVisit;
    return updateView(
      pathForSectionElement(sectionElementOfLink(nextLink)),
      metadataFromLink(nextLink),
      null,
      null,
      dfsDirectionInteger
    );
  }

  // Move to the next sibling
  let nextSiblingToVisit = dfsDirectionInteger === 1 ?
    linkAfter(selectedLink()) :
    linkBefore(selectedLink());

  if (nextSiblingToVisit) {
    let nextLink = nextSiblingToVisit;
    return updateView(
      pathForSectionElement(sectionElementOfLink(nextLink)),
      metadataFromLink(nextLink),
      null,
      null,
      dfsDirectionInteger
    );
  }

  // Move to parent
  let parentLink = parentLinkOfSection(sectionElementOfLink(selectedLink()));
  if (parentLink && parentLink.dataset.type !== 'global') {
    let nextLink = parentLink;
    return updateView(
      pathForSectionElement(sectionElementOfLink(nextLink)),
      metadataFromLink(nextLink),
      null,
      null,
      dfsDirectionInteger
    );
  }

  // Move to parent link that is a global link
  let globalParentLink = parentLinkOfSection(sectionElementOfLink(selectedLink()));
  if (
    globalParentLink &&
    globalParentLink.dataset.type === 'global' &&
    closeGlobalLinks
  ) {
    let nextLink = globalParentLink;
    return updateView(
      pathForSectionElement(sectionElementOfLink(nextLink)),
      metadataFromLink(nextLink),
      null,
      null,
      dfsDirectionInteger
    );
  }
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
