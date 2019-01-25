import setPath from 'path/set_path';
import {
  canopyContainer,
  sectionElementOfPath,
  parentLinkOfSection,
  documentTitleFor,
} from 'helpers/getters';
import {
  hideAllSectionElements,
  deselectAllLinks,
  clearDfsClasses
} from 'display/reset_page';
import {
  determineLinkToSelect,
  determineSectionElementToDisplay,
  createOrReplaceHeader,
  displaySectionBelowLink,
  addOpenClassToRedundantSiblings,
  addSelectedLinkClass,
  addOpenLinkClass
} from 'display/helpers';

const displayPath = (pathArray, providedLinkToSelect, selectALink, originatesFromPopStateEvent, directionOfDfs) => {
  let topicName = pathArray[0][0];
  const sectionElementOfCurrentPath = sectionElementOfPath(pathArray);
  if (!sectionElementOfCurrentPath) { throw "No section element found for path: " + pathArray }
  if (!originatesFromPopStateEvent) { setPath(pathArray); }
  document.title = documentTitleFor(topicName);

  createOrReplaceHeader(topicName);
  deselectAllLinks();
  clearDfsClasses(directionOfDfs);
  hideAllSectionElements();

  let linkToSelect = determineLinkToSelect(providedLinkToSelect, selectALink, pathArray, sectionElementOfCurrentPath, directionOfDfs);
  let sectionElementToDisplay = determineSectionElementToDisplay(linkToSelect, sectionElementOfCurrentPath);
  addSelectedLinkClass(linkToSelect);
  addOpenLinkClass(linkToSelect);

  displayPathTo(sectionElementToDisplay);
  window.scrollTo(0, canopyContainer.scrollHeight);
};

const displayPathTo = (sectionElement) => {
  sectionElement.style.display = 'block';

  if (sectionElement.parentNode === canopyContainer) {
    return;
  }

  let parentLink = parentLinkOfSection(sectionElement);
  parentLink.classList.add('canopy-open-link');
  addOpenClassToRedundantSiblings(parentLink);
  let parentSectionElement = parentLink.parentNode.parentNode;

  displayPathTo(parentSectionElement);
}

export default displayPath;
