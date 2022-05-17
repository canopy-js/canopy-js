import setPath from 'path/set_path';
import {
  canopyContainer,
  sectionElementOfPath,
  parentLinksOfSection,
  documentTitleFor,
  sectionElementContainingLink,
  paragraphElementOfSection
} from 'helpers/getters';

import {
  determineLinkToSelect,
  determineSectionElementToDisplay,
  setHeader,
  displaySectionBelowLink,
  addSelectedLinkClass,
  hideAllSectionElements,
  deselectAllLinks,
  removeDfsClasses,
  tryprojectPathPrefix,
  addLinkSelection
} from 'display/helpers';

import { storeLinkSelectionInSession } from 'history/helpers';

const displayPath = (pathArray, displayOptions) => {
  displayOptions = displayOptions || {};
  let sectionElement = sectionElementOfPath(pathArray);
  if (!pathIsValid(pathArray, sectionElement, displayOptions)) return;

  let topicName = pathArray[0][0];
  document.title = documentTitleFor(topicName);
  let displayTopicName = sectionElementOfPath([[topicName, topicName]]).dataset.displayTopicName;
  setHeader(displayTopicName);
  displayOptions.postDisplayCallback && displayOptions.postDisplayCallback();

  resetDom();

  let linkToSelect = determineLinkToSelect(pathArray, sectionElement, displayOptions);
  addSelectedLinkClass(linkToSelect);
  setPathAndStoreLinkInSession(pathArray, linkToSelect, displayOptions);

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
  let isPreviewParagraph = linkToSelect &&
    linkToSelect.dataset.type === 'local' &&
    paragraphElementOfSection(sectionElement.parentNode).
    contains(linkToSelect);

  parentLinks.forEach((parentLink) => parentLink.classList.add('canopy-open-link'));

  let parentSectionElement = sectionElementContainingLink(parentLinks[0]);
  displayPathTo(parentSectionElement, linkToSelect);
}

function pathIsValid(pathArray, sectionElement, displayOptions) {
  // If the path is more than one element, try the path prefix.
  // If the path is one element, there is nothing else to try, so throw error
  if (!sectionElement) {
    console.log("Unknown path: " + JSON.stringify(pathArray));
    console.log("Section Element: ", sectionElement);
    if (sectionElement) {
      console.log("Children: ", Array.from(sectionElement.childNodes).slice(1).map((el) => [el.dataset.subtopicName, el]));
    }
    if (!sectionElement && pathArray.length === 1) throw 'Unknown path';
    tryprojectPathPrefix(pathArray, displayOptions);
    return false;
  } else {
    return true;
  }
}

function setPathAndStoreLinkInSession(pathArray, linkToSelect, displayOptions) {
  // These operations must occur in this order so that the URL is updated first
  // and then the link selection data is stored in the session under that URL
  if (!displayOptions.pathAlreadyChanged) setPath(pathArray, linkToSelect);
  storeLinkSelectionInSession(linkToSelect);
}

const resetDom = () => {
  removeDfsClasses();
  deselectAllLinks();
  hideAllSectionElements();
}

export default displayPath;
