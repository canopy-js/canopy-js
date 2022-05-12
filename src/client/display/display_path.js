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
  tryPathPrefix,
  addLinkSelection
} from 'display/helpers';

import { storeLinkSelectionInSession } from 'history/helpers';

const displayPath = (pathArray, displayOptions) => {
  displayOptions = displayOptions || {};
  let sectionElement = sectionElementOfPath(pathArray);
  if (!sectionElement && pathArray.length === 1 && pathArray[0][0] === pathArray[0][1]) throw 'Unknown path';
  if (!sectionElement) return tryPathPrefix(pathArray, displayOptions);

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
  // We don't need to change the URL if the render was triggered by a history event because the URL has already changed
  if (!displayOptions.preservePath) setPath(pathArray, linkToSelect);
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

  parentLinks.forEach((parentLink) => parentLink.classList.add('canopy-open-link'));

  let parentSectionElement = sectionElementOfLink(parentLinks[0]);
  displayPathTo(parentSectionElement, linkToSelect);
}

export default displayPath;
