import { canopyContainer, rootSectionElement } from 'helpers/getters';
import { htmlIdFor } from 'helpers/identifiers';
import setPathAndFragment from 'helpers/set_path_and_fragment';
import { sectionElementOfTopic } from 'helpers/getters';
import {
  moveSelectedSectionClass,
  hideAllSectionElements,
  deselectAllLinks
} from 'display/reset_page';
import { parentLinkOfSectionElement, mostRecentlySelectedLinkOfSection } from 'helpers/getters';

const displayPath = (topicName, subtopicName, selectedLink) => {
  setPathAndFragment(topicName, subtopicName);
  const sectionElement = sectionElementOfTopic(topicName, subtopicName || topicName);
  if (!sectionElement) { return setPathAndFragment(topicName, topicName); }
  moveSelectedSectionClass(sectionElement);

  hideAllSectionElements();
  deselectAllLinks();

  var linkToSelect = selectedLink ||
    mostRecentlySelectedLinkOfSection(sectionElement) ||
    parentLinkOfSectionElement(sectionElement);
  if (linkToSelect) { linkToSelect.classList.add('canopy-selected-link'); }

  displayPathTo(sectionElement);
  window.scrollTo(0, canopyContainer.scrollHeight);
};

const displayPathTo = (sectionElement) => {
  sectionElement.style.display = 'block';
  if (sectionElement.parentNode === canopyContainer) {
    sectionElement.classList.add('canopy-current-root-section');
    return;
  }
  var parentLink = parentLinkOfSectionElement(sectionElement);
  parentLink.classList.add('canopy-open-link');
  var parentSectionElement = parentLink.parentNode.parentNode;
  displayPathTo(parentSectionElement);
}

export default displayPath;
