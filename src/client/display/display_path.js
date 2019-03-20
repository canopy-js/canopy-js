import setPath from 'path/set_path';
import {
  canopyContainer,
  sectionElementOfPath,
  parentLinksOfSection,
  documentTitleFor,
  sectionElementOfLink
} from 'helpers/getters';

import {
  determineLinkToSelect,
  determineSectionElementToDisplay,
  createOrReplaceHeader,
  displaySectionBelowLink,
  addOpenClassToRedundantSiblings,
  addSelectedLinkClass,
  addOpenLinkClass,
  hideAllSectionElements,
  deselectAllLinks,
  updateDfsClasses
} from 'display/helpers';

const displayPath = (pathArray, providedLinkToSelect, selectALink, originatesFromPopStateEvent, dfsDirectionInteger) => {
  let topicName = pathArray[0][0];
  const sectionElementOfCurrentPath = sectionElementOfPath(pathArray);
  if (!sectionElementOfCurrentPath) { throw "No section element found for path: " + pathArray }
  if (!originatesFromPopStateEvent) { setPath(pathArray); }
  document.title = documentTitleFor(topicName);

  let displayTopicName = sectionElementOfPath([[pathArray[0][0], pathArray[0][0]]]).dataset.topicDisplayName;
  createOrReplaceHeader(displayTopicName);
  updateDfsClasses(dfsDirectionInteger);
  deselectAllLinks();
  hideAllSectionElements();

  let linkToSelect = determineLinkToSelect(providedLinkToSelect, selectALink, pathArray, sectionElementOfCurrentPath, dfsDirectionInteger);
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

  let parentLinks = parentLinksOfSection(sectionElement);
  parentLinks.forEach((parentLink) => parentLink.classList.add('canopy-open-link'));
  let parentSectionElement = sectionElementOfLink(parentLinks[0]);
  displayPathTo(parentSectionElement);
}

export default displayPath;
