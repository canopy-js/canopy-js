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

function determineLinkToSelect(path, displayOptions) {
  let {
    linkSelectionData,
    selectALink
  } = displayOptions;

  if (linkSelectionData) {
    return findLinkFromMetadata(linkSelectionData);
  }

  if (selectALink) {
    return firstLinkOfSectionElement(path.sectionElement) ||
      parentLinkOfSection(path.sectionElement);
  } else {
    return null;
  }
}

function setHeader(topicName) {
  let existingHeader = document.querySelector('#_canopy h1')
  if (existingHeader) { existingHeader.remove(); }
  let headerDomElement = document.createElement('h1');
  let styleElements = renderStyledText(topicName);
  styleElements.forEach((element) => {headerDomElement.appendChild(element)});
  canopyContainer.prepend(headerDomElement);
};

function determineSectionElementToDisplay(linkToSelect, sectionElementOfCurrentPath, displayOptions) {
  // if (linkToSelect && displaySectionBelowLink(linkToSelect)) {
    // return childSectionElementOfParentLink(linkToSelect);
  // } else {
    return sectionElementOfCurrentPath;
  // }
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

function showsectionElementContainingLink(linkElement) {
  showSectionElement(sectionElementContainingLink(linkElement));
}

function removeDfsClasses() {
  forEach(document.getElementsByTagName("a"), function(linkElement) {
    linkElement.classList.remove('canopy-dfs-previously-selected-link');
    linkElement.classList.remove('canopy-reverse-dfs-previously-selected-link');
  });
}

function tryPathPrefix(path, displayOptions) {
  console.log("No section element found for path: ", JSON.stringify(path.toString()));
  console.log("Trying: ", JSON.stringify(path.withoutLastSegment));
  if (path.length > 1) {
    return displayPath(path.withoutLastSegment, displayOptions);
  } else {
    throw "Invalid path: " + path.array;
  }
}

export {
  determineLinkToSelect,
  determineSectionElementToDisplay,
  setHeader,
  displaySectionBelowLink,
  addSelectedLinkClass,
  moveSelectedSectionClass,
  hideAllSectionElements,
  deselectAllLinks,
  removeDfsClasses,
  tryPathPrefix
};
