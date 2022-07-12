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
  return
    linkToSelect?.dataset.type === 'local' ||
    redundantParentLinkInSameParagraphAsPrimary(linkToSelect)
}

function redundantParentLinkInSameParagraphAsPrimary(linkToSelect) {
  return linkToSelect?.dataset.type === 'redundant-local' &&
    siblingOfLinkLike(linkToSelect, (linkElement) => {
      return linkElement.dataset &&
        linkElement.dataset.targetTopic === linkToSelect.dataset.targetTopic &&
        linkElement.dataset.targetSubtopic === linkToSelect.dataset.targetSubtopic;
    })
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

function tryPathPrefix(path, displayOptions) {
  console.log("No section element found for path: ", JSON.stringify(path.toString()));
  console.log("Trying: ", JSON.stringify(path.withoutLastSegment));
  if (path.length > 1) {
    return displayPath(path.withoutLastSegment, null, displayOptions);
  } else {
    throw "Invalid path: " + path.array;
  }
}

const resetDom = () => {
  deselectAllLinks();
  hideAllSectionElements();
}

function pathForUrl(pathToDisplay, link) {
  // Import references display the path to the target paragraph, but the URL should be the link's enclosing paragraph
  if (link && link.type === 'import') {
    return link.enclosingParagraph.path;
  } else {
    return pathToDisplay; // otherwise the path of the displayed paragraph should be the path used in the URL
  }
}

export {
  setHeader,
  displaySectionBelowLink,
  resetDom,
  tryPathPrefix,
  pathForUrl
};
