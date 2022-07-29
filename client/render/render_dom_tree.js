import displayPath from 'display/display_path';
import fetchAndRenderPath from 'render/fetch_and_render_path';
import BlockRenderers from 'render/block_renderers';
import requestJson from 'requests/request_json';
import Path from 'models/path'
import Paragraph from 'models/paragraph';
import Topic from '../../bin/commands/shared/topic';

function renderDomTree(renderContext) {
  let {
    pathToDisplay,
    subtopic,
    paragraphsBySubtopic
  } = renderContext;

  let sectionElement = createSectionElement(renderContext);

  renderContext.displayBlockingPromises = [];
  renderContext.localLinkSubtreeCallback = localLinkSubtreeCallback(sectionElement, renderContext);
  renderContext.globalLinkSubtreeCallback = globalLinkSubtreeCallback(sectionElement, renderContext);

  let blocksOfParagraph = paragraphsBySubtopic[subtopic.mixedCase];
  if (!blocksOfParagraph) throw `Paragraph with subtopic not found: ${subtopic.mixedCase}`;
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
        subtopic: new Topic(token.targetSubtopic)
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
    subtopic,
    displayBlockingPromises
  } = renderContext;

  return (token, linkElement) => {
    let topic = new Topic(token.targetTopic);
    requestJson(topic); // eager-load and cache

    if (globalLinkIsOpen(linkElement, pathToDisplay, subtopic)) {
      let newPath = pathToDisplay.withoutFirstSegment;
      let whenTopicTreeAppended = fetchAndRenderPath(newPath, sectionElement);
      displayBlockingPromises.push(whenTopicTreeAppended)
    }
  }
}

function createSectionElement(renderContext) {
  let {
    topic, subtopic, displayTopicName, pathDepth
  } = renderContext;

  let sectionElement = document.createElement('section');
  sectionElement.classList.add('canopy-section');
  let paragraphElement = document.createElement('p');
  paragraphElement.classList.add('canopy-paragraph');
  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.dataset.topicName = topic.mixedCase;
  sectionElement.dataset.displayTopicName = displayTopicName;
  sectionElement.dataset.subtopicName = subtopic.mixedCase;
  sectionElement.dataset.pathDepth = pathDepth;

  if (topic.mixedCase === subtopic.mixedCase) {
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

function globalLinkIsOpen(linkElement, path, currentlyRenderingSubtopic) {
  let subtopicOfPathContainingOpenGlobalReference = path.firstSubtopic;
  let openGlobalLinkExists = path.secondTopic;

  let openGlobalLinkTargetTopic = path.secondTopic;
  let openGlobalLinkTargetSubtopic = openGlobalLinkTargetTopic;

  let thisGlobalLinkIsPointingToTheRightThingToBeOpen =
    linkElement.dataset.targetTopic === openGlobalLinkTargetTopic?.mixedCase &&
    linkElement.dataset.targetSubtopic === openGlobalLinkTargetSubtopic?.mixedCase;

  let thisGlobalLinkIsInCorrectSubtopicToBeOpen = currentlyRenderingSubtopic.mixedCase ===
    subtopicOfPathContainingOpenGlobalReference.mixedCase;

  return openGlobalLinkExists &&
    thisGlobalLinkIsPointingToTheRightThingToBeOpen &&
    thisGlobalLinkIsInCorrectSubtopicToBeOpen;
}

export default renderDomTree;
