import { htmlIdFor } from 'helpers/identifiers';
import displayPath from 'display/display_path';
import setPath from 'path/set_path';
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
    promises
  } = renderContext;

  return (token, globalLinkOpen) => {
    eagerLoad(token.targetTopic);

    if (globalLinkOpen) {
      if (subtreeAlreadyRenderedForPriorGlobalLinkInParagraph(sectionElement, token)) {
        return;
      }

      let pathArrayForSubtree = (pathArray).slice(1);
      let pathDepthOfSubtree = pathDepth + 1;

      let whenTopicTreeAppended = fetchAndRenderPath(pathArrayForSubtree, sectionElement);

      promises.push(whenTopicTreeAppended);
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

export default renderDomTree;
