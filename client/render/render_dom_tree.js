import displayPath from 'display/display_path';
import fetchAndRenderPath from 'render/fetch_and_render_path';
import BlockRenderers from 'render/block_renderers';
import eagerLoad from 'requests/eager_load';
import Path from 'models/path'
import Paragraph from 'models/paragraph';

function renderDomTree(renderContext) {
  let {
    pathToDisplay,
    subtopicName,
    paragraphsBySubtopic
  } = renderContext;

  let sectionElement = createSectionElement(renderContext);

  renderContext.displayBlockingPromises = [];
  renderContext.localLinkSubtreeCallback = localLinkSubtreeCallback(sectionElement, renderContext);
  renderContext.globalLinkSubtreeCallback = globalLinkSubtreeCallback(sectionElement, renderContext);

  let blocksOfParagraph = paragraphsBySubtopic[subtopicName];
  if (!blocksOfParagraph) throw `Paragraph with subtopic not found: ${subtopicName}`;
  let blockElements = renderElementsForBlocks(blocksOfParagraph, renderContext);

  blockElements.forEach((blockElement) => {
    let paragraph = new Paragraph(sectionElement);
    paragraph.paragraphElement.appendChild(blockElement);
  });

  return Promise.all(renderContext.displayBlockingPromises).then((_) => sectionElement);
}

function localLinkSubtreeCallback(sectionElement, renderContext) {
  return (token) => {
    let promisedSubtree = renderDomTree(
      Object.assign({}, renderContext, {
        subtopicName: token.targetSubtopic,
        placeHolderElement: null
      })
    );

    promisedSubtree.then((subtree) => {
      sectionElement.appendChild(subtree);
    });

    renderContext.displayBlockingPromises.push(promisedSubtree);
  }
}

function globalLinkSubtreeCallback(sectionElement, renderContext) {
  let {
    pathToDisplay,
    pathDepth,
    subtopicName,
    displayBlockingPromises
  } = renderContext;

  return (token, linkElement) => {
    eagerLoad(token.targetTopic);

    if (globalLinkIsOpen(linkElement, pathToDisplay, subtopicName)) {
      let newPath = pathToDisplay.withoutFirstSegment;
      let whenTopicTreeAppended = fetchAndRenderPath(newPath, sectionElement);
      displayBlockingPromises.push(whenTopicTreeAppended)
    }
  }
}

function createSectionElement(renderContext) {
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

function globalLinkIsOpen(linkElement, path, currentlyRenderingSubtopicName) {
  let subtopicOfPathContainingOpenGlobalReference = path.firstSubtopic;
  let openGlobalLinkExists = path.secondTopic;

  let openGlobalLinkTargetTopic = path.secondTopic;
  let openGlobalLinkTargetSubtopic = openGlobalLinkTargetTopic;
  let thisGlobalLinkIsPointingToTheRightThingToBeOpen =
    linkElement.dataset.targetTopic === openGlobalLinkTargetTopic &&
    linkElement.dataset.targetSubtopic === openGlobalLinkTargetSubtopic;

  let thisGlobalLinkIsInCorrectSubtopicToBeOpen = currentlyRenderingSubtopicName ===
    subtopicOfPathContainingOpenGlobalReference;

  return openGlobalLinkExists &&
    thisGlobalLinkIsPointingToTheRightThingToBeOpen &&
    thisGlobalLinkIsInCorrectSubtopicToBeOpen;
}

export default renderDomTree;
