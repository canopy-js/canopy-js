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
  documentTitleFor,
  childSectionElementOfParentLink,
  sectionElementOfLink
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

const displayPath = (pathArray, linkToSelect, selectALink, popState) => {
  var topicName = pathArray[0][0];

  const sectionElementOfCurrentPath = sectionElementOfPath(pathArray);

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

  if (!linkToSelect){
    if (selectALink){
      var lastPathSegment = pathArray[pathArray.length - 1];
      if (lastPathSegment[0] !== lastPathSegment[1]) {
        linkToSelect = parentLinkOfSection(sectionElementOfCurrentPath) || null;
      } else {
        linkToSelect = firstLinkOfSection(sectionElementOfCurrentPath);
      }
    }
  }

  var sectionElementToDisplay = (linkToSelect && linkToSelect.classList.contains('canopy-parent-link') ?
  childSectionElementOfParentLink(linkToSelect) :
  sectionElementOfPath(pathArray)) || sectionElementOfCurrentPath;

  if (linkToSelect) { linkToSelect.classList.add('canopy-selected-link'); }
  if (linkToSelect && linkToSelect.classList.contains('canopy-parent-link')) {
    linkToSelect.classList.add('canopy-open-link');
  }

  !popState && setPathAndFragment(pathArray);
  displayPathTo(sectionElementToDisplay);
  window.scrollTo(0, canopyContainer.scrollHeight);
};

const displayPathTo = (sectionElement) => {
  sectionElement.style.display = 'block';
  if (sectionElement.parentNode === canopyContainer) {
    return;
  }
  var parentLink = parentLinkOfSection(sectionElement);
  parentLink.classList.add('canopy-open-link');

  Array.from(parentLink.parentNode.childNodes).filter((linkElement) => {
    return linkElement.dataset &&
           linkElement.dataset.targetTopic === parentLink.dataset.targetTopic &&
           linkElement.dataset.targetSubtopic === parentLink.dataset.targetSubtopic;
  }).forEach((redundantParentLink) => {
    redundantParentLink.classList.add('canopy-open-link');
  });

  var parentSectionElement = parentLink.parentNode.parentNode;
  displayPathTo(parentSectionElement);
}

export default displayPath;
