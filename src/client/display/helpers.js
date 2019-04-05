import {
  canopyContainer,
  siblingOfLinkLike,
  firstLinkOfSectionElement,
  childSectionElementOfParentLink,
  parentLinkOfSection,
  lastLinkOfSectionElement,
  selectedLink,
  linksOfSectionLike,
  forEach,
  findLinkFromMetadata
} from 'helpers/getters';

import renderStyledText from 'render/render_styled_text';

function newNodeAlreadyPresent(anchorElement, domTree) {
  return Array.from(anchorElement.childNodes)
    .filter((childNode) => {
      return childNode.dataset &&
        childNode.dataset.topicName === domTree.dataset.topicName &&
        childNode.dataset.subtopicName === domTree.dataset.subtopicName;
    }).length > 0;
}

function determineLinkToSelect(pathArray, displayOptions) {
  let {
    linkSelectionData,
    selectALink,
    sectionElementOfCurrentPath
  } = displayOptions;

  if (linkSelectionData) {
    return findLinkFromMetadata(linkSelectionData);
  }

  if (selectALink) {
    if (lastPathSegmentIsATopicRoot(pathArray)) {
      return firstLinkOfSectionElement(sectionElementOfCurrentPath) ||
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
  let headerDomElement = document.createElement('h1');
  let styleElements = renderStyledText(topicName);
  styleElements.forEach((element) => {headerDomElement.appendChild(element)});
  canopyContainer.prepend(headerDomElement);
};

function determineSectionElementToDisplay(linkToSelect, displayOptions) {
  if (linkToSelect && displaySectionBelowLink(linkToSelect)) {
    return childSectionElementOfParentLink(linkToSelect);
  } else {
    return displayOptions.sectionElementOfCurrentPath;
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

function moveSelectedSectionClass(sectionElement) {
  forEach(document.getElementsByTagName("section"), function(sectionElement) {
    sectionElement.classList.remove('canopy-selected-section');
  });
  sectionElement.classList.add('canopy-selected-section');
}

function hideAllSectionElements() {
  forEach(document.getElementsByTagName("section"), function(sectionElement) {
    sectionElement.style.display = 'none';
  });
}

function deselectAllLinks() {
  forEach(document.getElementsByTagName("a"), function(linkElement) {
    linkElement.classList.remove('canopy-selected-link');
    linkElement.classList.remove('canopy-open-link');
  });
}

function hideSectionElement(sectionElement) {
  sectionElement.style.display = 'none';
}

function showSectionElement(sectionElement) {
  sectionElement.style.display = 'block';
}

function showSectionElementOfLink(linkElement) {
  showSectionElement(sectionElementOfLink(linkElement));
}

function removeDfsClasses() {
  forEach(document.getElementsByTagName("a"), function(linkElement) {
    linkElement.classList.remove('canopy-dfs-previously-selected-link');
    linkElement.classList.remove('canopy-reverse-dfs-previously-selected-link');
  });
}

export {
  newNodeAlreadyPresent,
  determineLinkToSelect,
  determineSectionElementToDisplay,
  createOrReplaceHeader,
  displaySectionBelowLink,
  addSelectedLinkClass,
  moveSelectedSectionClass,
  hideAllSectionElements,
  deselectAllLinks,
  removeDfsClasses
};
