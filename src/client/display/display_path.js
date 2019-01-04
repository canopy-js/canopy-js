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

const displayPath = (pathArray, providedLinkToSelect, selectALink, originatesFromPopStateEvent, directionToPreserveDfsClassesIn) => {
  let topicName = pathArray[0][0];
  document.title = documentTitleFor(topicName);
  const sectionElementOfCurrentPath = sectionElementOfPath(pathArray);

  createOrReplaceHeader(topicName);
  deselectAllLinks();
  clearDfsClasses(directionToPreserveDfsClassesIn);
  hideAllSectionElements();

  let linkToSelect = determineLinkToSelect(providedLinkToSelect, selectALink, pathArray, sectionElementOfCurrentPath);
  let sectionElementToDisplay = determineSectionElementToDisplay(linkToSelect, sectionElementOfCurrentPath);
  addSelectedLinkClass(linkToSelect);
  addOpenLinkClass(linkToSelect);

  if (!originatesFromPopStateEvent) { setPath(pathArray); }
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
