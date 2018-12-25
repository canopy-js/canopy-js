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
  canopyContainer
} from 'helpers/getters';
import {
  parentLinkOf,
  firstLinkOfSection,
  linkAfter,
  linkBefore,
  firstSiblingOf,
  lastSiblingOf,
  firstChildLinkOfParentLink,
  lastChildLinkOfParentLink,
  isTopicRootSection,
  isTreeRootSection,
  pathForSectionElement,
  enclosingTopicSectionOfLink
} from 'helpers/relationships';
import updateView from 'render/update_view';
import setPathAndFragment from 'path/set_path';
import displayPath from 'display/display_path';
import parsePathString from 'path/parse_path_string';
import { deselectAllLinks } from 'display/reset_page';
import pathStringFor from 'path/path_string_for';

function moveUpward() {
  // TODO: If root, unselect link

  var linkElement = parentLinkOf(selectedLink()) ||
    firstLinkOfSection(currentRootSection());
  var pathArray = parsePathString();

  if (isTreeRootSection(sectionElementOfLink(selectedLink()))) {
    var sectionElement = sectionElementOfLink(selectedLink());
    pathArray = [[
      sectionElement.dataset.topicName,
      sectionElement.dataset.topicName
    ]];

    linkElement = null;
  } else if (isTopicRootSection(sectionElementOfLink(selectedLink()))) {
    pathArray.pop();

    var currentSectionElement = currentSection();
    var sectionElementOfSelectedLink = sectionElementOfLink(selectedLink());

    if (currentSectionElement !== sectionElementOfSelectedLink && selectedLink().classList.contains('canopy-global-link')) { //handle global link with inlined child with no links
      linkElement = selectedLink();
    }
  } else {
    var finalTuple = pathArray.pop();
    var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.push(newTuple);
  }

  updateView(
    pathArray,
    metadataFromLink(linkElement)
  );
}

function moveDownward(cycle) {
  var pathArray = parsePathString();

  if (selectedLink().classList.contains('canopy-redundant-parent-link')) {
    var finalTuple = pathArray.pop();
    var newTuple = [finalTuple[0], selectedLink().dataset.targetSubtopic];
    pathArray.push(newTuple);
    var linkElement = parentLinkOfSection(sectionElementOfPath(pathArray));

    displayPath(
      pathArray,
      linkElement
    );
  }

  var linkElement =
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
    var finalTuple = pathArray.pop();
    var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.push(newTuple);
  }

  displayPath(
    pathArray,
    linkElement
  );
}

function moveLeftward() {
  var currentSectionElement = currentSection();
  var sectionElementOfSelectedLink = sectionElementOfLink(selectedLink());

  var pathArray = parsePathString();

  if (selectedLink().classList.contains('canopy-global-link') && // handle left on inlined global with no child links
    currentSectionElement !== sectionElementOfSelectedLink) {
    pathArray.pop();
  }

  var linkElement = linkBefore(selectedLink()) || lastSiblingOf(selectedLink());

  var finalTuple = pathArray.pop();
  var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.push(newTuple);

  displayPath(
    pathArray,
    linkElement
  );
}

function moveRightward() {
  var currentSectionElement = currentSection();
  var sectionElementOfSelectedLink = sectionElementOfLink(selectedLink());

  var linkElement = linkAfter(selectedLink()) || firstSiblingOf(selectedLink());

  var pathArray = parsePathString();

  if (selectedLink().classList.contains('canopy-global-link') && // handle left on inlined global with no child links
    currentSectionElement !== sectionElementOfSelectedLink) {
    pathArray.pop();
  }

  var finalTuple = pathArray.pop();
  var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.push(newTuple);

  displayPath(
    pathArray,
    linkElement
  );
}

function moveDownOrRedirect(newTab) {
  if (selectedLink().classList.contains('canopy-parent-link') ||
      selectedLink().classList.contains('canopy-redundant-parent-link')) {
    moveDownward(false);
  } else if (selectedLink().classList.contains('canopy-global-link')) {
    var pathArray = [[
      selectedLink().dataset.targetTopic,
      selectedLink().dataset.targetSubtopic
    ]];

    if (newTab) {
      var pathString = pathStringFor(pathArray);
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
  var nextLink;
  var previouslySelectedLinkClassName = forwardDirection ?
    'canopy-dfs-previously-selected-link' :
    'canopy-reverse-dfs-previously-selected-link';
  var previouslySelectedLink =
    document.querySelector('.' + previouslySelectedLinkClassName);

  var lastChildToVisit = forwardDirection ?
    lastChildLinkOfParentLink(selectedLink()) :
    firstChildLinkOfParentLink(selectedLink());

  var firstChildToVisit = forwardDirection ?
    firstChildLinkOfParentLink(selectedLink()) :
    lastChildLinkOfParentLink(selectedLink());

  if ((!previouslySelectedLink || previouslySelectedLink !== lastChildToVisit) &&
    selectedLink().dataset.type !== 'global' &&
    !skipChildren
  ) {
    nextLink = firstChildToVisit;
  }

  var nextSiblingToVisit = forwardDirection ?
    linkAfter(selectedLink()) :
    linkBefore(selectedLink());

  if (!nextLink) {
    nextLink = nextSiblingToVisit;
  }

  var parentLink = parentLinkOfSection(sectionElementOfLink(selectedLink()));
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
  var sectionElement = enclosingTopicSectionOfLink(selectedLink());
  var linkElement = openLinkOfSection(sectionElement) || selectedLink();

  updateView(
    pathForSectionElement(sectionElement),
    metadataFromLink(linkElement)
  );
}

function goToParentOfEnclosingTopic() {
  var sectionElement = enclosingTopicSectionOfLink(selectedLink());
  if (sectionElement.parentNode !== canopyContainer) {
    sectionElement = sectionElement.parentNode;
  }
  var linkElement = openLinkOfSection(sectionElement);

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
