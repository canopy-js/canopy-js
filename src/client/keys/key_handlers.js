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
  childSectionElementOfParentLink,
  forEach,
  linksOfSectionElement
} from 'helpers/getters';

import {
  isATopicRootSection,
  isPageRootSection,
  sectionHasNoChildLinks
} from 'helpers/booleans';

import { pathForSectionElement } from 'path/helpers';
import updateView from 'display/update_view';
import setPath from 'path/set_path';
import parsePathString from 'path/parse_path_string';
import pathStringFor from 'path/path_string_for';
import { deselectAllLinks } from 'display/helpers';

function moveUpward() {
  let pathArray = parsePathString();
  if (selectedLinkIsOpenGlobalLinkWithNoChildren()) {
    pathArray.pop();
    let linkElement = selectedLink();
    return updateView(
      pathArray,
      { linkSelectionData: metadataFromLink(linkElement) }
    );
  }

  if (selectedLinkIsOpenLocalLinkWithNoChildren()) {
    let linkElement = selectedLink();
    let finalTuple = pathArray.pop();
    let newTuple = [finalTuple[0], linkElement.dataset.enclosingSubtopic];
    pathArray.push(newTuple);

    return updateView(
      pathArray,
      { linkSelectionData: metadataFromLink(linkElement) }
    );
  }

  if (isPageRootSection(sectionElementOfLink(selectedLink()))) {
    let sectionElement = sectionElementOfLink(selectedLink());
    pathArray = [[
      sectionElement.dataset.topicName,
      sectionElement.dataset.topicName
    ]];
    return updateView(pathArray);
  }

  if (isATopicRootSection(sectionElementOfPath(pathArray))) {
    pathArray.pop();
    let linkElement = parentLinkOf(selectedLink());
    return updateView(
      pathArray,
      { linkSelectionData: metadataFromLink(linkElement) }
    );
  }

  if (selectedLink().dataset.type === 'local' ||
      selectedLink().dataset.type === 'global' ||
      selectedLink().dataset.type === 'redundant-local') {
    let linkElement = parentLinkOf(selectedLink());
    let finalTuple = pathArray.pop();
    let newTuple = [finalTuple[0], linkElement.dataset.enclosingSubtopic];
    pathArray.push(newTuple);
    return updateView(
      pathArray,
      { linkSelectionData: metadataFromLink(linkElement) }
    );
  }
}

function selectedLinkIsOpenGlobalLinkWithNoChildren() {
  let currentSectionElement = currentSection();
  let sectionElementOfSelectedLink = sectionElementOfLink(selectedLink());

  return currentSectionElement !== sectionElementOfSelectedLink &&
      selectedLink().dataset.type === 'global'
}

function selectedLinkIsLocalLinkWithNoChildren() {
  if (selectedLink().dataset.type !== 'local') {
    return false;
  }

  let links = linksOfSectionElement(
      childSectionElementOfParentLink(
        selectedLink()
      )
    );

  return links.length === 0;
}

function selectedLinkIsOpenLocalLinkWithNoChildren() {
  return selectedLinkIsLocalLinkWithNoChildren() &&
    selectedLink().classList.contains('canopy-open-link')
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
      { selectALink: true }
    );
  }

  if (selectedLink().dataset.type === 'local') {
    let linkElement = selectedLink();
    let finalTuple = pathArray.pop();
    let newTuple = [finalTuple[0], linkElement.dataset.targetSubtopic];
    pathArray.push(newTuple);
    return updateView(
      pathArray,
      { selectALink: true }
    );
  }

  if (selectedLink().dataset.type === 'redundant-local') {
    let finalTuple = pathArray.pop();
    let newTuple = [finalTuple[0], selectedLink().dataset.targetSubtopic];
    pathArray.push(newTuple);
    let linkElement = firstLinkOfSectionElement(sectionElementOfPath(pathArray));
    return updateView(
      pathArray,
      { selectALink: true }
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
  let newTuple = [finalTuple[0], linkElement.dataset.enclosingSubtopic];
  pathArray.push(newTuple);

  updateView(
    pathArray,
    { linkSelectionData: metadataFromLink(linkElement) }
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
  let newTuple = [finalTuple[0], linkElement.dataset.enclosingSubtopic];
  pathArray.push(newTuple);

  updateView(
    pathArray,
    { linkSelectionData: metadataFromLink(linkElement) }
  );
}

function moveDownOrRedirect(newTab, altKey) {
  if (selectedLink().dataset.type === 'local' ||
      selectedLink().dataset.type === 'redundant-parent') {
    return moveDownward(false);
  } else if (selectedLink().dataset.type === 'global') {
    let pathArray;
    let options;

    if (altKey) { // in-line topic mode
      if (selectedLinkIsOpenGlobalLinkWithNoChildren()) { // If it is open, close it
        let linkElement = parentLinkOfSection(currentSection());
        options = { linkSelectionData: metadataFromLink(linkElement) }
        pathArray = parsePathString().slice(0, -1);
      } else { // If it is closed, open it
        pathArray = parsePathString().concat([[
          selectedLink().dataset.targetTopic,
          selectedLink().dataset.targetSubtopic
        ]])
      }
    } else { // redirecting to new topic page
      pathArray = [[
        selectedLink().dataset.targetTopic,
        selectedLink().dataset.targetSubtopic
      ]];
      options = { selectALink: true };
    }

    if (newTab) {
      let pathString = pathStringFor(pathArray);
      return window.open(
        location.origin + pathString,
        '_blank'
      );
    }

    updateView(
      pathArray,
      options || { selectALink: true }
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

function depthFirstSearch(dfsDirectionInteger) {
  let previouslySelectedLinkClassName = dfsDirectionInteger === 1 ?
    'canopy-dfs-previously-selected-link' :
    'canopy-reverse-dfs-previously-selected-link';
  let previouslySelectedLink = document.querySelector('.' + previouslySelectedLinkClassName);

  // Enter a parent link
  let lastChildToVisit = dfsDirectionInteger === 1 ?
    lastChildLinkOfParentLink(selectedLink()) :
    firstChildLinkOfParentLink(selectedLink());

  let firstChildToVisit = dfsDirectionInteger === 1 ?
    firstChildLinkOfParentLink(selectedLink()) :
    lastChildLinkOfParentLink(selectedLink());

  let alreadyVisitedAllDescendantsOfLink = selectedLinkIsLocalLinkWithNoChildren() ?
    (previouslySelectedLink && selectedLink() && previouslySelectedLink === selectedLink()) :
    (previouslySelectedLink && lastChildToVisit && previouslySelectedLink === lastChildToVisit);

  if (
    (!previouslySelectedLink || !alreadyVisitedAllDescendantsOfLink) &&
    selectedLink().dataset.type !== 'global' &&
    selectedLink().dataset.type !== 'redundant-local'
  ) {
    let nextLink;
    let sectionToDisplay;
    if (firstChildToVisit) {
      nextLink = firstChildToVisit;
      sectionToDisplay = sectionElementOfLink(nextLink);
    } else {
      nextLink = selectedLink();
      sectionToDisplay = childSectionElementOfParentLink(selectedLink());
    }

    return updateView(
      pathForSectionElement(sectionToDisplay),
      {
        linkSelectionData: metadataFromLink(nextLink),
        postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
      }
    );
  }

  // Close a parent link with children
  if (selectedLinkIsOpenLocalLinkWithNoChildren()) {
    return updateView(
      pathForSectionElement(sectionElementOfLink(selectedLink())),
      {
        linkSelectionData: metadataFromLink(selectedLink()),
        postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
      }
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
      {
        linkSelectionData: metadataFromLink(nextLink),
        postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
      }
    );
  }

  // Move to parent
  let parentLink = parentLinkOfSection(sectionElementOfLink(selectedLink()));
  if (parentLink && parentLink.dataset.type !== 'global') {
    let nextLink = parentLink;
    return updateView(
      pathForSectionElement(sectionElementOfLink(nextLink)),
      {
        linkSelectionData: metadataFromLink(nextLink),
        postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
      }
    );
  }
}

function updateDfsClassesCallback(dfsDirectionInteger) {
  return () => {
    let previouslySelectedLinkClassName = dfsDirectionInteger === 1 ?
    'canopy-dfs-previously-selected-link' :
    'canopy-reverse-dfs-previously-selected-link';
    let previouslySelectedLink = document.querySelector('.' + previouslySelectedLinkClassName);

    if (previouslySelectedLink) {
      previouslySelectedLink.classList.remove(previouslySelectedLinkClassName);
    }
    selectedLink() && selectedLink().classList.add(previouslySelectedLinkClassName);
    let preserveForwardDfsClass = dfsDirectionInteger === 1;
    let preserveBackwardsDfsClass = dfsDirectionInteger === 2;

    forEach(document.getElementsByTagName("a"), function(linkElement) {
      !preserveForwardDfsClass && linkElement.classList.remove('canopy-dfs-previously-selected-link');
      !preserveBackwardsDfsClass && linkElement.classList.remove('canopy-reverse-dfs-previously-selected-link');
    });
  }
}

function goToEnclosingTopic() {
  let sectionElement = enclosingTopicSectionOfLink(selectedLink());
  let linkElement = openLinkOfSection(sectionElement) || selectedLink();

  updateView(
    pathForSectionElement(sectionElement),
    { linkSelectionData: metadataFromLink(linkElement) }
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
    { linkSelectionData: metadataFromLink(linkElement) }
  );
}

export {
  moveUpward,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect,
  depthFirstSearch,
  goToEnclosingTopic,
  goToParentOfEnclosingTopic
};
