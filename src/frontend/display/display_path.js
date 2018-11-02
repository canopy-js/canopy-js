import { canopyContainer, rootSectionElement, selectedLink } from 'helpers/getters';
import { htmlIdFor } from 'helpers/identifiers';
import setPathAndFragment from 'helpers/set_path_and_fragment';
import { sectionElementOfTopic, linkNumberOf, parentLinkOfSection } from 'helpers/getters';
import {
  moveSelectedSectionClass,
  hideAllSectionElements,
  deselectAllLinks
} from 'display/reset_page';
import { currentLinkNumberAndLinkTypeAsObject } from 'helpers/getters';

const displayPath = (topicName, subtopicName, linkToSelect) => {
  // setPathAndFragment(topicName, subtopicName, linkNumberOf(selectedLink())); //TODO: make unidirectional
  const sectionElement = sectionElementOfTopic(topicName, subtopicName || topicName);
  if (!sectionElement) { return setPathAndFragment(topicName, topicName); }
  moveSelectedSectionClass(sectionElement);

  hideAllSectionElements();
  deselectAllLinks();

  var linkToSelect = linkToSelect ||
    parentLinkOfSection(sectionElement);
  if (linkToSelect) { linkToSelect.classList.add('canopy-selected-link'); }
  if (linkToSelect && linkToSelect.classList.contains('canopy-parent-link')) {
    linkToSelect.classList.add('canopy-open-link');
  }

  history.replaceState(
    currentLinkNumberAndLinkTypeAsObject(),
    document.title,
    window.location.href
  );

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
