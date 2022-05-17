import {
  currentSection,
  selectedLink,
  sectionElementContainingLink,
  parentLinkOfSection,
  metadataForLink,
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
  isPageRootSection
} from 'helpers/booleans';

import { pathForSectionElement } from 'path/helpers';
import updateView from 'display/update_view';
import { deselectAllLinks } from 'display/helpers';
import Path from 'models/path';

function moveUpward() {
  let path = Path.current;
  if (selectedLinkIsOpenGlobalLinkWithNoChildren()) {
    let linkElement = selectedLink();
    return updateView(
      path.withoutLastSegment,
      { linkSelectionData: metadataForLink(linkElement) }
    );
  }

  if (selectedLinkIsOpenLocalLinkWithNoChildren()) {
    let linkElement = selectedLink();
    return updateView(
      path.newTerminalSubtopic(linkElement.dataset.enclosingSubtopic),
      { linkSelectionData: metadataForLink(linkElement) }
    );
  }

  if (isPageRootSection(sectionElementContainingLink(selectedLink()))) {
    let rootSection = sectionElementContainingLink(selectedLink());
    return updateView(path.rootPath);
  }

  if (isATopicRootSection(path.sectionElement)) {
    let linkElement = parentLinkOf(selectedLink());
    return updateView(
      path.withoutLastSegment,
      { linkSelectionData: metadataForLink(linkElement) }
    );
  }

  if (selectedLink().dataset.type === 'local' ||
      selectedLink().dataset.type === 'global' ||
      selectedLink().dataset.type === 'redundant-local') {
    let linkElement = parentLinkOf(selectedLink());
    return updateView(
      path.newTerminalSubtopic(linkElement.dataset.enclosingSubtopic),
      { linkSelectionData: metadataForLink(linkElement) }
    );
  }
}

function selectedLinkIsOpenGlobalLinkWithNoChildren() {
  let currentSectionElement = currentSection();
  let sectionElementOfSelectedLink = sectionElementContainingLink(selectedLink());

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
  let path = Path.current;

  if (selectedLink().dataset.type === 'global') {
    // Handle open global link with no children
    if (selectedLink().classList.contains('canopy-open-link')) { return; }

    let newPath = path.addSegment(
      selectedLink().dataset.targetTopic,
      selectedLink().dataset.targetSubtopic
    );

    return updateView(
      newPath,
      { selectALink: true }
    );
  }

  if (selectedLink().dataset.type === 'local') {
    let linkElement = selectedLink();
    let newPath = path.newTerminalSubtopic(linkElement.dataset.targetSubtopic);

    return updateView(
      newPath,
      { selectALink: true }
    );
  }

  if (selectedLink().dataset.type === 'redundant-local') {
    let newPath = path.newTerminalSubtopic(selectedLink().dataset.targetSubtopic);

    return updateView(
      newPath,
      { selectALink: true }
    );
  }
}

function moveLeftward() {
  moveLaterally(-1);
}

function moveRightward() {
  moveLaterally(1);
}

function moveLaterally(directionInteger) {
  let currentSectionElement = currentSection();
  let sectionElementOfSelectedLink = sectionElementContainingLink(selectedLink());
  let newPath = Path.current;

  // handle right on opened global link with no child links
  if (selectedLink().dataset.type === 'global' &&
    currentSectionElement !== sectionElementOfSelectedLink) {
    newPath = path.withoutLastSegment;
  }

  let linkElement;
  if (directionInteger === 1) {
    linkElement = linkAfter(selectedLink()) || firstSiblingOf(selectedLink());
  } else if (directionInteger === -1) {
    linkElement = linkBefore(selectedLink()) || lastSiblingOf(selectedLink());
  }

  updateView(
    newPath,
    { linkSelectionData: metadataForLink(linkElement) }
  );
}

function moveDownOrRedirect(newTab, altKey) {
  if (selectedLink().dataset.type === 'local' ||
      selectedLink().dataset.type === 'redundant-parent') {
    return moveDownward(false);
  } else if (selectedLink().dataset.type === 'global') {
    let path;
    let options;

    if (altKey) { // in-line topic mode
      if (selectedLinkIsOpenGlobalLinkWithNoChildren()) { // If it is open, close it
        let linkElement = parentLinkOfSection(currentSection());
        options = { linkSelectionData: metadataForLink(linkElement) }
        path = Path.current.withoutLastSegment;
      } else { // If it is closed, open it
        path = Path.current.addSegment(
          selectedLink().dataset.targetTopic,
          selectedLink().dataset.targetSubtopic
        )
      }
    } else { // redirecting to new topic page
      path = new Path([[
        selectedLink().dataset.targetTopic,
        selectedLink().dataset.targetSubtopic
      ]]);
      options = { selectALink: true };
    }

    if (newTab) {
      return window.open(
        location.origin + path.string,
        '_blank'
      );
    }

    updateView(
      path,
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
      sectionToDisplay = sectionElementContainingLink(nextLink);
    } else {
      nextLink = selectedLink();
      sectionToDisplay = childSectionElementOfParentLink(selectedLink());
    }

    return updateView(
      pathForSectionElement(sectionToDisplay),
      {
        linkSelectionData: metadataForLink(nextLink),
        postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
      }
    );
  }

  // Close a parent link with children
  if (selectedLinkIsOpenLocalLinkWithNoChildren()) {
    return updateView(
      pathForSectionElement(sectionElementContainingLink(selectedLink())),
      {
        linkSelectionData: metadataForLink(selectedLink()),
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
      pathForSectionElement(sectionElementContainingLink(nextLink)),
      {
        linkSelectionData: metadataForLink(nextLink),
        postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
      }
    );
  }

  // Move to parent
  let parentLink = parentLinkOfSection(sectionElementContainingLink(selectedLink()));
  if (parentLink && parentLink.dataset.type !== 'global') {
    let nextLink = parentLink;
    return updateView(
      pathForSectionElement(sectionElementContainingLink(nextLink)),
      {
        linkSelectionData: metadataForLink(nextLink),
        postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
      }
    );
  }

  // Cycle
  let nextLink = dfsDirectionInteger === 1 ?
    firstLinkOfSectionElement(sectionElementContainingLink(selectedLink())) :
    lastLinkOfSectionElement(sectionElementContainingLink(selectedLink()));

  return updateView(
    pathForSectionElement(sectionElementContainingLink(nextLink)),
    {
      linkSelectionData: metadataForLink(nextLink),
      postDisplayCallback: updateDfsClassesCallback(dfsDirectionInteger)
    }
  );
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
    { linkSelectionData: metadataForLink(linkElement) }
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
    { linkSelectionData: metadataForLink(linkElement) }
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
