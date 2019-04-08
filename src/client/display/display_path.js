import setPath from 'path/set_path';
import {
  canopyContainer,
  sectionElementOfPath,
  parentLinksOfSection,
  documentTitleFor,
  sectionElementOfLink,
  paragraphElementOfSection
} from 'helpers/getters';

import {
  determineLinkToSelect,
  determineSectionElementToDisplay,
  createOrReplaceHeader,
  displaySectionBelowLink,
  addSelectedLinkClass,
  hideAllSectionElements,
  deselectAllLinks,
  removeDfsClasses,
  removeLastPathElement
} from 'display/helpers';

import { storeLinkSelectionInSession } from 'history/helpers';

const displayPath = (pathArray, displayOptions) => {
  displayOptions = displayOptions || {};
  let sectionElement = sectionElementOfPath(pathArray);
  if (!sectionElement) return tryPathPrefix(pathArray, displayOptions);
  if (!displayOptions.originatesFromPopStateEvent) { setPath(pathArray); }

  let topicName = pathArray[0][0];
  document.title = documentTitleFor(topicName);
  let displayTopicName = sectionElementOfPath([[topicName, topicName]]).dataset.topicDisplayName;
  createOrReplaceHeader(displayTopicName);

  removeDfsClasses();
  displayOptions.postDisplayCallback && displayOptions.postDisplayCallback();
  deselectAllLinks();
  hideAllSectionElements();

  let linkToSelect = determineLinkToSelect(pathArray, sectionElement, displayOptions);
  let sectionElementToDisplay = determineSectionElementToDisplay(linkToSelect, sectionElement, displayOptions);
  addSelectedLinkClass(linkToSelect);
  storeLinkSelectionInSession(linkToSelect);

  displayPathTo(sectionElementToDisplay, linkToSelect);
  window.scrollTo(0, canopyContainer.scrollHeight);
};

const displayPathTo = (sectionElement, linkToSelect) => {
  sectionElement.style.display = 'block';

  if (sectionElement.parentNode === canopyContainer) {
    return;
  }

  let parentLinks = parentLinksOfSection(sectionElement);
  let isPreviewParagraph = linkToSelect &&
    linkToSelect.dataset.type === 'local' &&
    paragraphElementOfSection(sectionElement.parentNode).
    contains(linkToSelect);

  if (isPreviewParagraph) {
    parentLinks.forEach((parentLink) => parentLink.classList.add('canopy-preview-link'));
  } else {
    parentLinks.forEach((parentLink) => parentLink.classList.add('canopy-open-link'));
  }

  let parentSectionElement = sectionElementOfLink(parentLinks[0]);
  displayPathTo(parentSectionElement, linkToSelect);
}

function tryPathPrefix(pathArray, displayOptions) {
  console.log("No section element found for path: ", pathArray);
  console.log("Trying: ", removeLastPathElement(pathArray))
  return displayPath(removeLastPathElement(pathArray), displayOptions);
}

export default displayPath;
