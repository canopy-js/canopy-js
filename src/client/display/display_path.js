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
  removeDfsClasses
} from 'display/helpers';

import { storeLinkSelectionInSession } from 'history/helpers';

const displayPath = (pathArray, displayOptions) => {
  displayOptions = displayOptions || {};
  let topicName = pathArray[0][0];
  displayOptions.sectionElementOfCurrentPath = sectionElementOfPath(pathArray);
  if (!displayOptions.sectionElementOfCurrentPath) { throw "No section element found for path: " + pathArray }
  if (!displayOptions.originatesFromPopStateEvent) { setPath(pathArray); }
  document.title = documentTitleFor(topicName);

  let displayTopicName = sectionElementOfPath([[topicName, topicName]]).dataset.topicDisplayName;
  createOrReplaceHeader(displayTopicName);
  displayOptions.postDisplayCallback && displayOptions.postDisplayCallback();
  deselectAllLinks();
  hideAllSectionElements();
  removeDfsClasses();

  let linkToSelect = determineLinkToSelect(pathArray, displayOptions);
  let sectionElementToDisplay = determineSectionElementToDisplay(linkToSelect, displayOptions);
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

export default displayPath;
