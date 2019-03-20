import {
  canopyContainer,
  siblingOfLinkLike,
  firstLinkOfSectionElement,
  childSectionElementOfParentLink,
  parentLinkOfSection,
  lastLinkOfSectionElement,
  selectedLink,
  linksOfSectionLike
} from 'helpers/getters';

import renderStyledText from 'render/render_styled_text';

function newNodeAlreadyPresent(anchorElement, domTree) {
  return Array.from(anchorElement.childNodes)
    .filter((childNode) => {
      return childNode.dataset &&
        childNode.dataset.topicName === domTree.dataset.topicName &&
        childNode.dataset.subtopicName === domTree.dataset.subtopicName;
    }).length > 0;
}

function determineLinkToSelect(providedLink, selectALink, pathArray, sectionElementOfCurrentPath, dfsDirectionInteger) {
  if (providedLink) {
    return providedLink;
  }

  let nextChildLink;
  if (dfsDirectionInteger === 1) {
    nextChildLink = firstLinkOfSectionElement(sectionElementOfCurrentPath);
  } else if (dfsDirectionInteger === 2) {
    nextChildLink = lastLinkOfSectionElement(sectionElementOfCurrentPath);
  } else {
    nextChildLink = firstLinkOfSectionElement(sectionElementOfCurrentPath);
  }

  if (selectALink) {
    if (lastPathSegmentIsATopicRoot(pathArray)) {
      return nextChildLink ||
      parentLinkOfSection(sectionElementOfCurrentPath);
    } else {
      return parentLinkOfSection(sectionElementOfCurrentPath);
    }
  } else {
    return null;
  }
}

function lastPathSegmentIsATopicRoot(pathArray) {
  let lastPathSegment = pathArray[pathArray.length - 1];
  return lastPathSegment[0] === lastPathSegment[1];
}

function createOrReplaceHeader(topicName) {
  let existingHeader = document.querySelector('#_canopy h1')
  if (existingHeader) { existingHeader.remove(); }
  let headerDomElement = document.createElement('h1');
  let styleElements = renderStyledText(topicName);
  styleElements.forEach((element) => {headerDomElement.appendChild(element)});
  canopyContainer.prepend(headerDomElement);
};

function determineSectionElementToDisplay(linkToSelect, sectionElementOfCurrentPath) {
  if (linkToSelect && displaySectionBelowLink(linkToSelect)) {
    return childSectionElementOfParentLink(linkToSelect);
  } else {
    return sectionElementOfCurrentPath;
  }
}

function displaySectionBelowLink(linkToSelect) {
  return linkToSelect &&
    (
      linkToSelect.dataset.type === 'local' ||
      redundantParentLinkInSameParagraphAsPrimary(linkToSelect)
    );
}

function redundantParentLinkInSameParagraphAsPrimary(linkToSelect) {
  return linkToSelect &&
    linkToSelect.dataset.type === 'redundant-local' &&
    siblingOfLinkLike(linkToSelect, (linkElement) => {
      return linkElement.dataset &&
        linkElement.dataset.targetTopic === linkToSelect.dataset.targetTopic &&
        linkElement.dataset.targetSubtopic === linkToSelect.dataset.targetSubtopic;
    })
}

function addSelectedLinkClass(linkToSelect) {
  if (linkToSelect) {
    linkToSelect.classList.add('canopy-selected-link');
  }
}

function addOpenLinkClass(linkToSelect) {
  if (linkToSelect && linkToSelect.dataset.type === 'local') {
    linkToSelect.classList.add('canopy-open-link');
  }
}

function addOpenClassToRedundantSiblings(parentLink) {
  linksOfSectionLike(
    sectionElementOfLink(parentLink),
    (linkElement) => linkElement.dataset &&
        linkElement.dataset.targetTopic === parentLink.dataset.targetTopic &&
        linkElement.dataset.targetSubtopic === parentLink.dataset.targetSubtopic
  ).forEach((redundantParentLink) => {
    redundantParentLink.classList.add('canopy-open-link');
  });
}


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

function updateDfsClasses(dfsDirectionInteger) {
  let previouslySelectedLinkClassName = dfsDirectionInteger === 1 ?
    'canopy-dfs-previously-selected-link' :
    'canopy-reverse-dfs-previously-selected-link';
  let previouslySelectedLink = document.querySelector('.' + previouslySelectedLinkClassName);

  if (previouslySelectedLink) {
    previouslySelectedLink.classList.remove(previouslySelectedLinkClassName);
  }
  selectedLink() && selectedLink().classList.add(previouslySelectedLinkClassName);

  let preserveForwardDfsClass = dfsDirectionInteger === 1;
  let preserveBackwardsDfsClass = dfsDirectionInteger === 2;

  forEach(document.getElementsByTagName("a"), function(linkElement) {
    !preserveForwardDfsClass && linkElement.classList.remove('canopy-dfs-previously-selected-link');
    !preserveBackwardsDfsClass && linkElement.classList.remove('canopy-reverse-dfs-previously-selected-link');
  });
}

export {
  newNodeAlreadyPresent,
  determineLinkToSelect,
  determineSectionElementToDisplay,
  createOrReplaceHeader,
  displaySectionBelowLink,
  addSelectedLinkClass,
  addOpenLinkClass,
  addOpenClassToRedundantSiblings,
  moveSelectedSectionClass,
  hideAllSectionElements,
  deselectAllLinks,
  updateDfsClasses
};
