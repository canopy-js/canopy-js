import { htmlIdFor } from 'helpers/identifiers';
import setPathAndFragment from 'path/set_path';
import {
  canopyContainer,
  rootSectionElement,
  selectedLink,
  sectionElementOfTopic,
  linkNumberOf,
  parentLinkOfSection,
  metadataFromLink,
  findLinkFromMetadata,
  documentTitleFor
} from 'helpers/getters';
import {
  moveSelectedSectionClass,
  hideAllSectionElements,
  deselectAllLinks
} from 'display/reset_page';

import { firstLinkOfSection } from 'helpers/relationships';

const displayPath = (pathArray, linkToSelect, selectFirstLink) => {
  var topicName = pathArray[0][0];
  var subtopicName = pathArray[0][1];

  const sectionElement = sectionElementOfTopic(topicName, subtopicName || topicName);
  if (!sectionElement) { return setPathAndFragment([[topicName, topicName]]); } // Does this ever happen?
  moveSelectedSectionClass(sectionElement);

  hideAllSectionElements();
  deselectAllLinks();

  if (!linkToSelect && selectFirstLink) {
    linkToSelect = firstLinkOfSection(sectionElement);
  } else if (!linkToSelect) {
    linkToSelect = parentLinkOfSection(sectionElement) || null;
  }

  if (linkToSelect) { linkToSelect.classList.add('canopy-selected-link'); }
  if (linkToSelect && linkToSelect.classList.contains('canopy-parent-link')) {
    linkToSelect.classList.add('canopy-open-link');
  }

  document.title = documentTitleFor(topicName, subtopicName);
  setPathAndFragment(pathArray);
  displayPathTo(sectionElement);
  window.scrollTo(0, canopyContainer.scrollHeight);
};

const displayPathTo = (sectionElement) => {
  sectionElement.style.display = 'block';
  if (sectionElement.parentNode === canopyContainer) {
    sectionElement.classList.add('canopy-current-root-section');
    return;
  }
  var parentLink = parentLinkOfSection(sectionElement);
  parentLink.classList.add('canopy-open-link');
  var parentSectionElement = parentLink.parentNode.parentNode;
  displayPathTo(parentSectionElement);
}

export default displayPath;
