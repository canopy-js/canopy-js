import Path from 'models/path';
import {
  canopyContainer,
  parentLinksOfSection,
  documentTitleFor,
  sectionElementContainingLink,
  paragraphElementOfSection
} from 'helpers/getters';

import {
  determineLinkToSelect,
  determineSectionElementToDisplay,
  setHeader,
  addSelectedLinkClass,
  hideAllSectionElements,
  deselectAllLinks,
  removeDfsClasses,
  tryPathPrefix
} from 'display/helpers';

import { storeLinkSelectionInSession } from 'history/helpers';

const displayPath = (path, displayOptions) => {
  displayOptions = displayOptions || {};
  let sectionElement = path.sectionElement;
  if (!path.sectionElement) return tryPathPrefix(path, displayOptions);

  document.title = documentTitleFor(path.firstTopic);
  let displayTopicName = path.firstSegment.sectionElement.dataset.displayTopicName;
  setHeader(displayTopicName);
  displayOptions.postDisplayCallback && displayOptions.postDisplayCallback();

  resetDom();

  let linkToSelect = determineLinkToSelect(path, displayOptions);
  addSelectedLinkClass(linkToSelect);
  setPathAndStoreLinkInSession(path, linkToSelect, displayOptions);

  let sectionElementToDisplay = determineSectionElementToDisplay(linkToSelect, sectionElement, displayOptions);
  displayPathTo(sectionElementToDisplay, linkToSelect);
  window.scrollTo(0, canopyContainer.scrollHeight);
};

const displayPathTo = (sectionElement, linkToSelect) => {
  sectionElement.style.display = 'block';

  if (sectionElement.parentNode === canopyContainer) {
    return;
  }

  let parentLinks = parentLinksOfSection(sectionElement);

  parentLinks.forEach((parentLink) => parentLink.classList.add('canopy-open-link'));

  let parentSectionElement = sectionElementContainingLink(parentLinks[0]);
  displayPathTo(parentSectionElement, linkToSelect);
}

function setPathAndStoreLinkInSession(path, linkToSelect, displayOptions) {
  // These operations must occur in this order so that the URL is updated first
  // and then the link selection data is stored in the session under that URL
  if (!displayOptions.pathAlreadyChanged) {
    Path.setPath(path, linkToSelect);
  }
  storeLinkSelectionInSession(linkToSelect);
}

const resetDom = () => {
  removeDfsClasses();
  deselectAllLinks();
  hideAllSectionElements();
}

export default displayPath;
