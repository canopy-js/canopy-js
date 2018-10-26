import { canopyContainer, rootSectionElement } from 'helpers/getters';
import { htmlIdFor } from 'helpers/identifiers';
import setPathAndFragment from 'helpers/set_path_and_fragment';
import { sectionElementOfTopic } from 'helpers/getters';

const displaySubtopic = (topicName, subtopicName) => {
  const sectionElement = sectionElementOfTopic(topicName, subtopicName);
  moveSelectedSectionClass(sectionElement);

  hideAllSectionElements();
  deselectAllLinks();
  displayPathTo(sectionElement);
  window.scrollTo(0, canopyContainer.scrollHeight);

};

const displayPathTo = (sectionElement) => {
  sectionElement.style.display = 'block';
  if (sectionElement.parentNode === canopyContainer) { return; }
  var parentLink = document.querySelector('#_canopy a.' + sectionElement.id);
  parentLink.classList.add('canopy-open-link');
  var parentSectionElement = parentLink.parentNode.parentNode;
  displayPathTo(parentSectionElement);
}

function forEach(list, callback) {
  for (var i = 0; i < list.length; i++) {
    callback(list[i]);
  }
}

function moveSelectedSectionClass(sectionElement) {
  forEach(document.getElementsByTagName("section"), function(sectionElement) {
    sectionElement.classList.remove('_canopy_selected_section');
  });
  sectionElement.classList.add('_canopy_selected_section');
}

function hideAllSectionElements() {
  forEach(document.getElementsByTagName("section"), function(sectionElement) {
    sectionElement.style.display = 'none';
  });
}

function deselectAllLinks() {
  forEach(document.getElementsByTagName("a"), function(linkElement) {
    linkElement.classList.remove('canopy-selected-link');
    linkElement.classList.remove('canopy-open-link');
  });
}

function hideSectionElement(sectionElement) {
  sectionElement.style.display = 'none';
}

function showSectionElement(sectionElement) {
  sectionElement.style.display = 'block';
}

function showSectionElementOfLink(linkElement) {
  showSectionElement(sectionElementOfLink(linkElement));
}

function underlineLink(linkElement) {
  linkElement.classList.add('canopy-open-link');
}

// function showPathTo(linkElement) {
//   showPathToRecursive(linkElement);

//   showPreviewIfParentLink(linkElement);
//   linkElement.classList.add('canopy-selected-link');

//   function showPathToRecursive(linkElement) {
//     showSectionElementOfLink(linkElement);
//     underlineLink(linkElement);

//     if (isInRootSection(linkElement)) {
//       return;
//     } else {
//       showPathToRecursive(parentLinkOf(linkElement));
//     }
//   }
// }

export default displaySubtopic;
