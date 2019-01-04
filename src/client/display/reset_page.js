import { childSectionElementOfParentLink } from 'helpers/getters';

function forEach(list, callback) {
  for (let i = 0; i < list.length; i++) {
    callback(list[i]);
  }
}

function moveSelectedSectionClass(sectionElement) {
  forEach(document.getElementsByTagName("section"), function(sectionElement) {
    sectionElement.classList.remove('canopy-selected-section');
  });
  sectionElement.classList.add('canopy-selected-section');
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

function clearDfsClasses(directionToPreserveDfsClassesIn) {
  let preserveForwardDfsClass = directionToPreserveDfsClassesIn === true;
  let preserveBackwardsDfsClass = directionToPreserveDfsClassesIn === false;

  forEach(document.getElementsByTagName("a"), function(linkElement) {
    !preserveForwardDfsClass && linkElement.classList.remove('canopy-dfs-previously-selected-link');
    !preserveBackwardsDfsClass && linkElement.classList.remove('canopy-reverse-dfs-previously-selected-link');
  });
}

export {
  moveSelectedSectionClass,
  hideAllSectionElements,
  deselectAllLinks,
  clearDfsClasses
};
