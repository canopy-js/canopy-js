import { canopyContainer } from 'helpers/getters';

import renderStyledText from 'render/render_styled_text';
import displayPath from 'display/display_path';

function setHeader(topicName) {
  let existingHeader = document.querySelector('#_canopy h1')
  if (existingHeader) { existingHeader.remove(); }
  let headerDomElement = document.createElement('h1');
  let styleElements = renderStyledText(topicName);
  Array.from(styleElements).forEach((element) => {headerDomElement.appendChild(element)});
  canopyContainer.prepend(headerDomElement);
};

function determineParagraphToDisplay(linkToSelect, paragraph, displayOptions) {
  // if (linkToSelect && displaySectionBelowLink(linkToSelect)) {
    // return childSectionElementOfParentLink(linkToSelect);
  // } else {
    return paragraph;
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

function moveSelectedSectionClass(sectionElement) {
  Array.from(document.getElementsByTagName("section")).forEach((sectionElement) => {
    sectionElement.classList.remove('canopy-selected-section');
  });
  sectionElement.classList.add('canopy-selected-section');
}

function hideAllSectionElements() {
  Array.from(document.getElementsByTagName("section")).forEach((sectionElement) => {
    sectionElement.style.display = 'none';
  });
}

function deselectAllLinks() {
  Array.from(document.getElementsByTagName("a")).forEach((linkElement) => {
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
  Array.from(document.getElementsByTagName("a")).forEach((linkElement) => {
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
  setHeader,
  displaySectionBelowLink,
  moveSelectedSectionClass,
  hideAllSectionElements,
  deselectAllLinks,
  removeDfsClasses,
  tryPathPrefix
};
