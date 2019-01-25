import {
  canopyContainer,
  siblingOfLinkLike,
  firstLinkOfSectionElement,
  childSectionElementOfParentLink,
  parentLinkOfSection,
  lastLinkOfSectionElement
} from 'helpers/getters';

function newNodeAlreadyPresent(anchorElement, domTree) {
  return Array.from(anchorElement.childNodes)
    .filter((childNode) => {
      return childNode.dataset &&
        childNode.dataset.topicName === domTree.dataset.topicName &&
        childNode.dataset.subtopicName === domTree.dataset.subtopicName;
    }).length > 0;
}

function determineLinkToSelect(providedLink, selectALink, pathArray, sectionElementOfCurrentPath, directionOfDfs) {
  if (providedLink) {
    return providedLink;
  }

  let nextChildLink;
  if (directionOfDfs === 1) {
    nextChildLink = firstLinkOfSectionElement(sectionElementOfCurrentPath);
  } else if (directionOfDfs === 2) {
    nextChildLink = lastLinkOfSectionElement(sectionElementOfCurrentPath);
  } else {
    nextChildLink = firstLinkOfSectionElement(sectionElementOfCurrentPath);
  }

  if (selectALink) {
    if (lastPathSegmentIsATopicRoot(pathArray)) {
      return nextChildLink ||
      parentLinkOfSection(sectionElementOfCurrentPath);
    } else {
      return parentLinkOfSection(sectionElementOfCurrentPath);
    }
  } else {
    return null;
  }
}

function lastPathSegmentIsATopicRoot(pathArray) {
  let lastPathSegment = pathArray[pathArray.length - 1];
  return lastPathSegment[0] === lastPathSegment[1];
}

function createOrReplaceHeader(topicName) {
  let existingHeader = document.querySelector('#_canopy h1')
  if (existingHeader) { existingHeader.remove(); }

  let headerTextNode = document.createTextNode(topicName)
  let headerDomElement = document.createElement('h1');
  headerDomElement.appendChild(headerTextNode);
  canopyContainer.prepend(headerDomElement);
};

function determineSectionElementToDisplay(linkToSelect, sectionElementOfCurrentPath) {
  if (linkToSelect && displaySectionBelowLink(linkToSelect)) {
    return childSectionElementOfParentLink(linkToSelect);
  } else {
    return sectionElementOfCurrentPath;
  }
}

function displaySectionBelowLink(linkToSelect) {
  return linkToSelect &&
    (
      linkToSelect.dataset.type === 'local' ||
      redundantParentLinkInSameParagraphAsPrimary(linkToSelect)
    );
}

function redundantParentLinkInSameParagraphAsPrimary(linkToSelect) {
  return linkToSelect &&
    linkToSelect.dataset.type === 'redundant-local' &&
    siblingOfLinkLike(linkToSelect, (linkElement) => {
      return linkElement.dataset &&
        linkElement.dataset.targetTopic === linkToSelect.dataset.targetTopic &&
        linkElement.dataset.targetSubtopic === linkToSelect.dataset.targetSubtopic;
    })
}

function addSelectedLinkClass(linkToSelect) {
  if (linkToSelect) {
    linkToSelect.classList.add('canopy-selected-link');
  }
}

function addOpenLinkClass(linkToSelect) {
  if (linkToSelect && linkToSelect.dataset.type === 'local') {
    linkToSelect.classList.add('canopy-open-link');
  }
}

function addOpenClassToRedundantSiblings(parentLink) {
  Array.from(parentLink.parentNode.childNodes).filter((linkElement) => {
    return linkElement.dataset &&
           linkElement.dataset.targetTopic === parentLink.dataset.targetTopic &&
           linkElement.dataset.targetSubtopic === parentLink.dataset.targetSubtopic;
  }).forEach((redundantParentLink) => {
    redundantParentLink.classList.add('canopy-open-link');
  });
}

export {
  newNodeAlreadyPresent,
  determineLinkToSelect,
  determineSectionElementToDisplay,
  createOrReplaceHeader,
  displaySectionBelowLink,
  addSelectedLinkClass,
  addOpenLinkClass,
  addOpenClassToRedundantSiblings
};
