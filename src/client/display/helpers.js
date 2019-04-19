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

import { sectionHasNoChildLinks } from 'helpers/booleans';

import renderStyledText from 'render/render_styled_text';
import displayPath from 'display/display_path';

function newNodeAlreadyPresent(anchorElement, domTree) {
  return Array.from(anchorElement.childNodes)
    .filter((childNode) => {
      return childNode.dataset &&
        childNode.dataset.topicName === domTree.dataset.topicName &&
        childNode.dataset.subtopicName === domTree.dataset.subtopicName;
    }).length > 0;
}

function determineLinkToSelect(pathArray, sectionElementOfCurrentPath, displayOptions) {
  let {
    linkSelectionData,
    selectALink,
    selectLinkIfGlobalParentHasNoChildren
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
  } else if (selectLinkIfGlobalParentHasNoChildren) {
    if (sectionHasNoChildLinks(sectionElementOfCurrentPath)) {
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

function determineSectionElementToDisplay(linkToSelect, sectionElementOfCurrentPath, displayOptions) {
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

function removeLastPathElement(pathArray) {
  let lastItem = pathArray[pathArray.length - 1];
  if (lastItem[0] === lastItem[1]) {
    return JSON.parse(JSON.stringify(pathArray.slice(0, -1)));
  } else {
    let newArray = JSON.parse(JSON.stringify(pathArray));
    let item = newArray.pop();
    item[1] = item[0];
    newArray.push(item);
    return newArray;
  }
}

function tryPathPrefix(pathArray, displayOptions) {
  console.log("No section element found for path: ", pathArray);
  console.log("Trying: ", removeLastPathElement(pathArray))
  return displayPath(removeLastPathElement(pathArray), displayOptions);
}

function addLinkSelection(pathArray, linkToSelect) {
  if (linkToSelect && linkToSelect.dataset.type === 'local') {
    let newArray = JSON.parse(JSON.stringify(pathArray));
    let item = newArray.pop();
    item[1] = linkToSelect.dataset.targetSubtopic
    newArray.push(item);
    return newArray;
  } else {
    return pathArray;
  }
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
  removeDfsClasses,
  removeLastPathElement,
  tryPathPrefix,
  addLinkSelection
};
