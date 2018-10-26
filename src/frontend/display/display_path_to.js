import { canopyContainer, rootSectionElement } from 'helpers/getters';
import { htmlIdFor } from 'helpers/identifiers';

const displayPathTo = (sectionElement) => {
  hideAllSectionElements();
  deselectAllLinks();

  displayPathSegmentTo(sectionElement);

  window.scrollTo(0, canopyContainer.scrollHeight);
}

const displayPathSegmentTo = (sectionElement) => {
  sectionElement.style.display = 'block';
  if (sectionElement.parentNode === canopyContainer) { return; }
  var parentLink = document.querySelector('#_canopy a.' + sectionElement.id);
  parentLink.classList.add('canopy-open-link');
  var parentSectionElement = parentLink.parentNode.parentNode;
  displayPathSegmentTo(parentSectionElement);
}

function forEach(list, callback) {
  for (var i = 0; i < list.length; i++) {
    callback(list[i]);
  }
}

function hideAllSectionElements() {
  forEach(document.getElementsByTagName("section"), function(sectionElement) {
    sectionElement.style.display = 'none';
  });
}

function deselectAllLinks() {
  forEach(document.getElementsByTagName("a"), function(linkElement) {
    linkElement.classList.remove('moss-selected-link');
    linkElement.classList.remove('moss-open-link');
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
//   linkElement.classList.add('moss-selected-link');

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

export default displayPathTo;
