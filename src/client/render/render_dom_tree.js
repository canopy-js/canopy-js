import { htmlIdFor } from 'helpers/identifiers';
import displayPath from 'display/display_path';
import { paragraphElementOfSection, linkOfSectionByTarget } from 'helpers/getters';
import fetchAndRenderPath from 'render/fetch_and_render_path';
import BlockRenderers from 'render/block_renderers';
import eagerLoad from 'requests/eager_load';

function renderDomTree(renderContext) {
  let {
    subtopicName,
    paragraphsBySubtopic
  } = renderContext;

  let sectionElement = createNewSectionElement(renderContext);

  renderContext.subtopicsAlreadyRendered[subtopicName] = true;
  renderContext.promises = [];
  renderContext.localLinkSubtreeCallback = localLinkSubtreeCallback(sectionElement, renderContext);
  renderContext.globalLinkSubtreeCallback = globalLinkSubtreeCallback(sectionElement, renderContext);

  let blocksOfParagraph = paragraphsBySubtopic[subtopicName];
  let blockElements = renderElementsForBlocks(blocksOfParagraph, renderContext);

  blockElements.forEach((blockElement) => {
    paragraphElementOfSection(sectionElement).appendChild(blockElement);
  });

  return Promise.all(renderContext.promises).then((_) => sectionElement);
}

function generateIsSubtopicAlreadyRenderedCallback(subtopicsAlreadyRendered) {
  return (targetSubtopic) => subtopicsAlreadyRendered.hasOwnProperty(targetSubtopic);
}

function localLinkSubtreeCallback(sectionElement, renderContext) {
  return (token) => {
    let promisedSubtree = renderDomTree(
      Object.assign({}, renderContext, {
        subtopicName: token.targetSubtopic
      })
    );

    promisedSubtree.then((subtree) => {
      sectionElement.appendChild(subtree);
    });

    renderContext.promises.push(promisedSubtree);
  }
}

function globalLinkSubtreeCallback(sectionElement, renderContext) {
  let {
    pathArray,
    pathDepth,
    subtopicName,
    eagerRenderGlobalChildren,
    promises
  } = renderContext;

  return (token, linkElement) => {
    eagerLoad(token.targetTopic);
    if (shouldRenderGlobalChild(linkElement, pathArray, subtopicName, eagerRenderGlobalChildren)) {
      let pathArrayForSubtree = pathArrayForGlobalChild(linkElement, pathArray, subtopicName);
      let newEagerRenderGlobalChildren = !sectionIsLastPathSegment(linkElement, pathArray, subtopicName);
      let whenTopicTreeAppended = fetchAndRenderPath(pathArrayForSubtree, sectionElement, newEagerRenderGlobalChildren);
      let currentSectionIsEagerRender = !eagerRenderGlobalChildren;
      if (!currentSectionIsEagerRender) { promises.push(whenTopicTreeAppended); } // eager render shouldn't block UI
    }
  }
}

function createNewSectionElement(renderContext) {
  let {
    topicName, subtopicName, displayTopicName, pathDepth
  } = renderContext;

  let sectionElement = document.createElement('section');
  let paragraphElement = document.createElement('p');
  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.displayTopicName = displayTopicName;
  sectionElement.dataset.subtopicName = subtopicName;
  sectionElement.dataset.pathDepth = pathDepth;

  if (topicName === subtopicName) {
    pathDepth > 0 && sectionElement.prepend(document.createElement('hr'));
    sectionElement.classList.add('canopy-topic-section');
  }

  return sectionElement;
}

function subtreeAlreadyRenderedForPriorGlobalLinkInParagraph(sectionElement, token) {
  return linkOfSectionByTarget(sectionElement,
    token.targetTopic,
    token.targetSubtopic
  );
}

function renderElementsForBlocks(blocksOfParagraph, renderContext) {
  let elementArray = [];

  blocksOfParagraph.forEach(
    (blockObject) => {
      let renderer = BlockRenderers[blockObject.type];
      let blockElements = renderer(
        blockObject,
        renderContext
      )
      elementArray = elementArray.concat(blockElements);
    }
  );

  return elementArray;
}

function shouldRenderGlobalChild(linkElement, pathArray, subtopicName, eagerRenderGlobalChildren) {
  // A global link's children should be rendered if either of the following is true
  // 1. Is the child of the global link the topic of the next path segment?
  // 2a. Is the current section containing the global link the final path subtopic element?
  // 2b. (And the current section element is not itself an eager render?)
  return globalLinkIsOpen(linkElement, pathArray, subtopicName) ||
    (sectionIsLastPathSegment(linkElement, pathArray) && eagerRenderGlobalChildren);
}

function pathArrayForGlobalChild(linkElement, pathArray, subtopicName) {
  if (globalLinkIsOpen(linkElement, pathArray, subtopicName)) {
    return pathArray.slice(1);
  } else if (sectionIsLastPathSegment(linkElement, pathArray)) {
    return [[linkElement.dataset.targetTopic, linkElement.dataset.targetTopic]];
  } else {
    throw "Generating path for global child that shouldn't be rendered";
  }
}

function globalLinkIsOpen(linkElement, pathArray, currentlyRenderingSubtopicName) {
  let subtopicOfPathContainingOpenGlobalReference = pathArray[0][1];
  let openGlobalLinkExists = pathArray[1];
  let openGlobalLinkTargetTopic = pathArray[1] && pathArray[1][0];
  let openGlobalLinkTargetSubtopic = openGlobalLinkTargetTopic;
  let thisIsTheOpenGlobalLink = 
    linkElement.dataset.targetTopic === openGlobalLinkTargetTopic &&
    linkElement.dataset.targetSubtopic === openGlobalLinkTargetSubtopic;
  let thisGlobalLinkIsInCorrectSubtopicToBeOpen = currentlyRenderingSubtopicName === 
    subtopicOfPathContainingOpenGlobalReference;

  return openGlobalLinkExists &&
    thisIsTheOpenGlobalLink &&
    thisGlobalLinkIsInCorrectSubtopicToBeOpen;
    
}

function sectionIsLastPathSegment(linkElement, pathArray) {
  return pathArray.length === 1 && 
    pathArray[0][0] === linkElement.dataset.enclosingTopic &&
    pathArray[0][1] === linkElement.dataset.enclosingSubtopic;
}

export default renderDomTree;
