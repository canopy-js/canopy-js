import { slugFor } from 'helpers/identifiers';
import { isInRootSection } from 'helpers/booleans';

const canopyContainer = document.getElementById('_canopy');
if(!canopyContainer) {
  throw new Error('Page must have an html element with id "_canopy"');
}

const defaultTopic = document.getElementById('_canopy').dataset.defaultTopic;
if(!defaultTopic) {
  throw new Error('HTML element with id "_canopy" must have a default topic data attribute');
}

const sectionElementOfPath = (pathArray) => {
  let currentNode = canopyContainer;

  for (let i = 0; i < pathArray.length; i++) {
    if (!currentNode) { return null; }

    let topicName = pathArray[i][0];
    let subtopicName = pathArray[i][1];

    currentNode = currentNode.querySelector(
      `[data-topic-name="${topicName}"]` +
      `[data-subtopic-name="${subtopicName}"]` +
      `[data-path-depth="${i}"]`
    );
  }

  return currentNode;
}

const currentSection = () => {
  let nodeList = document.querySelectorAll('section[style="display: block;"');
  return nodeList[nodeList.length - 1];
}

const selectedLink = () => {
  return document.querySelector('a.canopy-selected-link');
}

const currentRootSection = () => {
  let nodeList = document.querySelectorAll('section[style="display: block;"');
  return nodeList[0];
}

const parentLinkOfSection = (sectionElement) => {
  if (sectionElement.parentNode === canopyContainer) { return null; }

  return linkOfSectionByTarget(
    sectionElement.parentNode,
    sectionElement.dataset.topicName,
    sectionElement.dataset.subtopicName
  );
}

const parentLinksOfSection = (sectionElement) => {
  if (sectionElement.parentNode === canopyContainer) { return null; }

  return linksOfSectionByTarget(
    sectionElement.parentNode,
    sectionElement.dataset.topicName,
    sectionElement.dataset.subtopicName
  );
}

const childSectionElementOfParentLink = (linkElement) => {
  return Array.from(
    parentElementOfLink(linkElement, 'SECTION').
    childNodes).
    find((sectionElement) =>
      sectionElement.dataset.topicName === linkElement.dataset.targetTopic &&
      sectionElement.dataset.subtopicName === linkElement.dataset.targetSubtopic);
}

function sectionElementOfLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  let sectionElement = parentElementOfLink(linkElement, 'SECTION');

  return sectionElement;
}

function documentTitleFor(topicName) {
  return topicName;
}

function metadataFromLink(linkElement) {
  if (!linkElement) { return null; }

  let sectionElement = sectionElementOfLink(linkElement);

  let relativeLinkNumber = Array.from(
    sectionElement.querySelectorAll(
    ` a[data-text="${linkElement.dataset.text}"]`
  )).indexOf(linkElement);

  return {
    sectionElementTopicName: sectionElement.dataset.topicName,
    sectionElementSubtopicName: sectionElement.dataset.subtopicName,
    sectionElementPathDepth: sectionElement.dataset.pathDepth,
    linkText: linkElement.dataset.text,
    relativeLinkNumber: relativeLinkNumber
  };
}

function findLinkFromMetadata(linkSelectionData) {
  return document.querySelectorAll(
    `section[data-topic-name="${linkSelectionData.sectionElementTopicName}"]` +
    `[data-subtopic-name="${linkSelectionData.sectionElementSubtopicName}"]` +
    `[data-path-depth="${linkSelectionData.sectionElementPathDepth}"]` +
    ` a[data-text="${linkSelectionData.linkText}"]`
  )[linkSelectionData.relativeLinkNumber];
}

function findLowestExtantSectionElementOfPath(pathArray) {
  let lowestExtantSectionElementOfPath = null;
  let pathSuffixToRender = [];

  for (let i = 0; i < pathArray.length; i++) {
    let pathSegment = pathArray.slice(0, i + 1);
    let sectionElement = sectionElementOfPath(pathSegment);
    if (sectionElement) {
      lowestExtantSectionElementOfPath = sectionElementOfPath(pathSegment);
    } else {
      pathSuffixToRender = pathArray.slice(i);
      break;
    }
  }

  return { lowestExtantSectionElementOfPath, pathSuffixToRender };
}

function openLinkOfSection(sectionElement) {
  if (!sectionElement) {
    return null;
  }

  return linkOfSectionLike(
    sectionElement,
    (linkElement) => linkElement.classList.contains('canopy-open-link')
  );
}

function paragraphElementOfSection(sectionElement) {
  if (!sectionElement) {
    return null;
  }

  return Array.from(
    sectionElement.
    childNodes
  ).find((element) => element.tagName === 'P')
}

function linkAfter(linkElement) {
  if (!linkElement) {
    return null;
  }

  let paragraphElement = paragraphElementOfLink(linkElement);

  let links = paragraphElement.querySelectorAll('.canopy-selectable-link');
  if (linkElement !== links[links.length - 1]) {
    return links[
      Array.prototype.slice.call(links).indexOf(linkElement) + 1
    ];
  } else {
    return null;
  }
}

function parentElementOfLink(linkElement, tagName) {
  let parentElement = linkElement.parentNode;
  while (parentElement.tagName !== tagName) {
    parentElement = parentElement.parentNode;
  }
  return parentElement;
}

function paragraphElementOfLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  return parentElementOfLink(linkElement, 'P');
}

function linkBefore(linkElement) {
  if (!linkElement) {
    return null;
  }

  let paragraphElement = paragraphElementOfLink(linkElement);

  let links = paragraphElement.querySelectorAll('a.canopy-selectable-link');
  if (linkElement !== links[0]){
    return links[
      Array.prototype.slice.call(links).indexOf(linkElement) - 1
    ];
  } else {
    return null;
  }
}

function firstChildLinkOfParentLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  let sectionElement = childSectionElementOfParentLink(linkElement);
  if (!sectionElement) { return null; }

  let array = linksOfSectionElement(sectionElement);
  return array[0];
}

function lastChildLinkOfParentLink(linkElement) {
  if (!linkElement) {
    return null;
  }

  let sectionElement = childSectionElementOfParentLink(linkElement);
  if (!sectionElement) { return null; }

  let array = linksOfSectionElement(sectionElement);
  return array[array.length - 1];
}

function linksOfSectionElement(sectionElement) {
  if (!sectionElement) {
    return null;
  }

  return linksOfParagraph(paragraphElementOfSection(sectionElement));
}

function linksOfParagraph(paragraphElement) {
  if (!paragraphElement) {
    return null;
  }

  return Array.from(paragraphElement.querySelectorAll('a.canopy-selectable-link'));
}

function firstLinkOfSectionElement(sectionElement) {
  if (!sectionElement) {
    return null;
  }
  return linksOfSectionElement(sectionElement)[0] || null;
}

function lastLinkOfSectionElement(sectionElement) {
  if (!sectionElement) {
    return null;
  }

  let array = linksOfSectionElement(sectionElement);
  return array[array.length - 1] || null;
}

function enclosingTopicSectionOfLink(linkElement) {
  let sectionElement = sectionElementOfLink(linkElement);

  if (sectionElement.dataset.pathDepth === "0") {
    return currentRootSection();
  }

  let currentSectionElement = sectionElement;

  while (currentSectionElement.parentNode.dataset.pathDepth === sectionElement.dataset.pathDepth) {
    currentSectionElement = currentSectionElement.parentNode;
  }

  return currentSectionElement;
}

function firstSiblingOf(linkElement) {
  if (!linkElement){
    return null;
  }

  let links = linksOfSectionElement(sectionElementOfLink(linkElement));
  return links[0] || linkElement;
}

function lastSiblingOf(linkElement) {
  if (!linkElement){
    return null;
  }

  let links = linksOfSectionElement(sectionElementOfLink(linkElement));
  return links[links.length - 1] || null;
}

function parentLinkOf(linkElement) {
  if (!linkElement) {
    return null;
  }

  if (isInRootSection(linkElement)) {
    return null;
  }

  return parentLinkOfSection(sectionElementOfLink(linkElement));
}

function siblingOfLinkLike(linkElementArg, condition) {
  return Array.from(linkElementArg.parentNode.childNodes).find((linkElement) => {
      return condition(linkElement) &&
        linkElement !== linkElementArg;
    });
}

function linkOfSectionLike(sectionElement, condition) {
  return linksOfSectionElement(sectionElement).find(condition);
}

function linksOfSectionLike(sectionElement, condition) {
  return linksOfSectionElement(sectionElement).filter(condition);
}

function linkOfSectionByTarget(sectionElement, topicName, subtopicName) {
  return linkOfSectionLike(sectionElement, (linkElement) =>
    linkElement.dataset.targetTopic === topicName &&
    linkElement.dataset.targetSubtopic === subtopicName
  )
}

function linksOfSectionByTarget(sectionElement, topicName, subtopicName) {
  return linksOfSectionLike(sectionElement, (linkElement) =>
    linkElement.dataset.targetTopic === topicName &&
    linkElement.dataset.targetSubtopic === subtopicName
  )
}

export {
  canopyContainer,
  defaultTopic,
  sectionElementOfPath,
  currentSection,
  currentRootSection,
  selectedLink,
  parentLinkOfSection,
  parentLinksOfSection,
  childSectionElementOfParentLink,
  sectionElementOfLink,
  metadataFromLink,
  documentTitleFor,
  findLinkFromMetadata,
  findLowestExtantSectionElementOfPath,
  openLinkOfSection,
  paragraphElementOfSection,
  linksOfSectionElement,
  linkAfter,
  linkBefore,
  firstChildLinkOfParentLink,
  lastChildLinkOfParentLink,
  firstLinkOfSectionElement,
  lastLinkOfSectionElement,
  enclosingTopicSectionOfLink,
  firstSiblingOf,
  lastSiblingOf,
  parentLinkOf,
  siblingOfLinkLike,
  linkOfSectionLike,
  linksOfSectionLike,
  linkOfSectionByTarget,
  linksOfSectionByTarget,
  parentElementOfLink,
  paragraphElementOfLink
};
