import { canopyContainer } from 'helpers/getters';

import renderStyledText from 'render/render_styled_text';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import updateView from 'display/update_view';

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

function deselectSectionElement() {
  Array.from(document.querySelectorAll('.canopy-selected-section')).forEach((sectionElement) => {
    sectionElement.classList.remove('canopy-selected-section');
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
  console.log("No section element found for path: ", path.string);
  console.log("Trying: ", path.withoutLastSegment.string);
  if (path.length > 1) {
    return displayPath(path.withoutLastSegment, null, displayOptions);
  } else {
    console.error("Invalid path: " + path.array);
    return updateView(Path.default);
  }
}

const resetDom = () => {
  deselectAllLinks();
  hideAllSectionElements();
  deselectSectionElement();
}

function scrollPage(displayOptions) {
  let behavior = displayOptions.initialPageLoad ? 'auto' : 'smooth';

  window.scrollTo(
    {
      top: Link.selection.enclosingParagraph.paragraphElement.offsetTop - (window.screen.height * .3),
      behavior: behavior
    }
  );
}

export {
  setHeader,
  displaySectionBelowLink,
  resetDom,
  tryPathPrefix,
  scrollPage
};
