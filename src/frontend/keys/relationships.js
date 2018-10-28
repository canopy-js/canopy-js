import { selectedLink, currentRootSection} from 'helpers/getters';
import {
  childSectionElementOfParentLink,
  parentLinkOfSectionElement,
  sectionElementOfLink
} from 'helpers/getters';

function upwardLink() {
  return parentLinkOf(selectedLink()) ||
    firstLinkOfSection(currentRootSection());
}

function downwardLink() {
  return firstChildLinkOf(selectedLink()) ||
    linkAfter(selectedLink()) ||
    selectedLink();
}

function leftwardLink() {
  return linkBefore(selectedLink()) || lastSiblingOf(selectedLink());
}

function rightwardLink() {
  return linkAfter(selectedLink()) || firstSiblingOf(selectedLink());
}


function firstSiblingOf(linkElement) {
  if (linkElement === null){
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');
  return links[0] || linkElement;
}

function lastSiblingOf(linkElement) {
  if (linkElement === null){
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');
  return links[links.length - 1] || null;
}

function parentLinkOf(linkElement) {
  if (linkElement === null) {
    return null;
  }

  if (isInRootSection(linkElement)) {
    return null;
  }

  return parentLinkOfSectionElement(sectionElementOfLink(linkElement));
}

function isInRootSection(linkElement) {
  return sectionElementOfLink(linkElement) === currentRootSection();
}

function linkAfter(linkElement) {
  if (linkElement === null) {
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');
  if (linkElement !== links[links.length - 1]){
    return links[
      Array.prototype.slice.call(links).indexOf(linkElement) + 1
    ];
  } else {
    return null;
  }
}

function linkBefore(linkElement) {
  if (linkElement === null) {
    return null;
  }

  var links = linkElement.parentNode.querySelectorAll('a');
  if (linkElement !== links[0]){
    return links[
      Array.prototype.slice.call(links).indexOf(linkElement) - 1
    ];
  } else {
    return null;
  }
}

function firstChildLinkOf(linkElement) {
  if (linkElement === null){
    return null;
  }

  if (!linkElement.classList.contains('canopy-parent-link')) {
    return null;
  }

  var sectionElement = childSectionElementOfParentLink(linkElement);
  return sectionElement.querySelectorAll('a')[0];
}

function firstLinkOfSection(sectionElement) {
  if (sectionElement === null){
    return null;
  }

  return sectionElement.querySelectorAll('a')[0] || null;
}


export {
  firstSiblingOf,
  lastSiblingOf,
  leftwardLink,
  rightwardLink,
  linkAfter,
  linkBefore,
  upwardLink,
  downwardLink
};
