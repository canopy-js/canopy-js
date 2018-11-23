import { htmlIdFor } from 'helpers/identifiers';
import setPathAndFragment from 'path/set_path';
import {
  canopyContainer,
  rootSectionElement,
  selectedLink,
  sectionElementOfPath,
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
import { defaultTopic } from 'helpers/getters';
import updateView from 'render/update_view';
import { firstLinkOfSection } from 'helpers/relationships';
import createOrReplaceHeader from 'display/create_or_replace_header';

const displayPath = (pathArray, linkToSelect, selectALink) => {
  var topicName = pathArray[pathArray.length - 1][0];
  var subtopicName = pathArray[pathArray.length - 1][1];

  const sectionElement = sectionElementOfPath(pathArray);
  // if (!sectionElement) {
  //   // Try each path segment, etc
  //   return updateView([[topicName, topicName]]);
  //   // return updateView(
  //   // pathArray.slice(0, pathArray.length + 1) ||
  //   // [[pathArray[0][0], pathArray[0][1]]]) // Maybe this should try pathArray[i][0], pathArray[i][0] first
  // }

  createOrReplaceHeader(topicName);

  hideAllSectionElements();
  deselectAllLinks();

  if (pathArray[pathArray.length - 1][0] !== pathArray[pathArray.length - 1][1] && selectALink && !linkToSelect) {
    linkToSelect = parentLinkOfSection(sectionElement) || null;
  } else if (!linkToSelect && selectALink) {
    linkToSelect = firstLinkOfSection(sectionElement);
  } else if (!linkToSelect) {
    // linkToSelect = parentLinkOfSection(sectionElement) || null;
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
    return;
  }
  var parentLink = parentLinkOfSection(sectionElement);
  parentLink.classList.add('canopy-open-link');
  var parentSectionElement = parentLink.parentNode.parentNode;
  displayPathTo(parentSectionElement);
}

export default displayPath;
