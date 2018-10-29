function forEach(list, callback) {
  for (var i = 0; i < list.length; i++) {
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
    sectionElement.classList.remove('canopy-current-root-section');
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

export {
  moveSelectedSectionClass,
  hideAllSectionElements,
  deselectAllLinks
};
