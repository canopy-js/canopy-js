import { htmlIdFor } from 'helpers/identifiers';
import displayPath from 'display/display_path';
import fetchAndRenderPath from 'render/fetch_and_render_path';
import BlockRenderers from 'render/block_renderers';
import eagerLoad from 'requests/eager_load';
import Path from 'models/path'
import Paragraph from 'models/paragraph';

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
    let paragraph = new Paragraph(sectionElement);
    paragraph.paragraphElement.appendChild(blockElement);
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
    path,
    pathDepth,
    subtopicName,
    eagerRenderGlobalChildren,
    promises
  } = renderContext;

  return (token, linkElement) => {
    eagerLoad(token.targetTopic);
    if (shouldRenderGlobalChild(linkElement, path, subtopicName, eagerRenderGlobalChildren)) {
      let pathForSubtree = pathForGlobalChild(linkElement, path, subtopicName);
      let newEagerRenderGlobalChildren = !sectionIsLastPathSegment(linkElement, path, subtopicName);
      let whenTopicTreeAppended = fetchAndRenderPath(pathForSubtree, sectionElement, newEagerRenderGlobalChildren);
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
  sectionElement.classList.add('canopy-section');
  let paragraphElement = document.createElement('p');
  paragraphElement.classList.add('canopy-paragraph');
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

function shouldRenderGlobalChild(linkElement, path, subtopicName, eagerRenderGlobalChildren) {
  // A global link's children should be rendered if either of the following is true
  // 1. Is the child of the global link the topic of the next path segment?
  // 2a. Is the current section containing the global link the final path subtopic element?
  // 2b. (And the current section element is not itself an eager render?)
  return globalLinkIsOpen(linkElement, path, subtopicName) ||
    (sectionIsLastPathSegment(linkElement, path) && eagerRenderGlobalChildren);
}

function pathForGlobalChild(linkElement, path, subtopicName) {
  if (globalLinkIsOpen(linkElement, path, subtopicName)) {
    return path.withoutFirstSegment;
  } else if (sectionIsLastPathSegment(linkElement, path)) {
    return Path.forTopic(linkElement.dataset.targetTopic);
  } else {
    throw "Generating path for global child that shouldn't be rendered";
  }
}

function globalLinkIsOpen(linkElement, path, currentlyRenderingSubtopicName) {
  let subtopicOfPathContainingOpenGlobalReference = path.firstSubtopic;
  let openGlobalLinkExists = path.secondTopic;
  let openGlobalLinkTargetTopic = path.secondTopic;
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

function sectionIsLastPathSegment(linkElement, path) {
  return path.length === 1 &&
    path.firstTopic === linkElement.dataset.enclosingTopic &&
    path.firstSubtopic === linkElement.dataset.enclosingSubtopic;
}

export default renderDomTree;
