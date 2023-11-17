import fetchAndRenderPath from 'render/fetch_and_render_path';
import requestJson from 'requests/request_json';
import Paragraph from 'models/paragraph';
import Link from 'models/link';
import Topic from '../../cli/shared/topic';
import renderTokenElement from 'render/render_token_element';

function renderDomTree(renderContext) {
  let {
    subtopic,
    paragraphsBySubtopic
  } = renderContext;

  let sectionElement = createSectionElement(renderContext);
  let paragraph = new Paragraph(sectionElement);

  renderContext.displayBlockingPromises = [];
  renderContext.localLinkSubtreeCallback = localLinkSubtreeCallback(sectionElement, renderContext);
  renderContext.globalLinkSubtreeCallback = globalLinkSubtreeCallback(sectionElement, renderContext);

  let tokensOfParagraph = paragraphsBySubtopic[subtopic.mixedCase];
  if (!tokensOfParagraph) throw new Error(`Paragraph with subtopic not found: ${subtopic.mixedCase}`);

  tokensOfParagraph.forEach((token) => {
    let element = renderTokenElement(token, renderContext);
    paragraph.paragraphElement.appendChild(element);
  });

  return Promise.all(renderContext.displayBlockingPromises).then(() => sectionElement);
}

function localLinkSubtreeCallback(sectionElement, renderContext) {
  return (token) => {
    let promisedSubtree = renderDomTree(
      Object.assign({}, renderContext, {
        subtopic: Topic.fromMixedCase(token.targetSubtopic)
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
    subtopic,
    displayBlockingPromises
  } = renderContext;

  return (token, linkElement) => {
    let topic = Topic.fromMixedCase(token.targetTopic);
    let link = new Link(linkElement);
    requestJson(topic); // eager-load and cache

    if (globalLinkIsOpen(link, pathToDisplay, subtopic)) {
      let newPath = pathToDisplay.withoutFirstSegment;
      let whenTopicTreeAppended = fetchAndRenderPath(newPath, sectionElement);
      displayBlockingPromises.push(whenTopicTreeAppended)
    }
  }
}

function createSectionElement(renderContext) {
  let {
    topic, subtopic, displayTopicName, pathDepth, paragraphsBySubtopic
  } = renderContext;

  let sectionElement = document.createElement('section');
  sectionElement.classList.add('canopy-section');
  let paragraphElement = document.createElement('p');
  paragraphElement.classList.add('canopy-paragraph');
  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.style.opacity = '0';
  sectionElement.dataset.displayTopicName = displayTopicName;
  sectionElement.dataset.topicName = topic.mixedCase;
  sectionElement.dataset.subtopicName = subtopic.mixedCase;
  sectionElement.dataset.pathDepth = pathDepth;
  let tokens = paragraphsBySubtopic[topic.mixedCase];

  if (topic.mixedCase === subtopic.mixedCase) {
    if (pathDepth > 0 && tokens.length > 0) sectionElement.prepend(document.createElement('hr'));
    sectionElement.classList.add('canopy-topic-section');
  }

  return sectionElement;
}

// When rendering the links of a paragraph, is a given link the parent link of
// the next paragraph in the visible path?

function globalLinkIsOpen(link, path, currentlyRenderingSubtopic) {
  let subtopicOfPathContainingOpenGlobalReference = path.firstSubtopic;
  let openGlobalLinkExists = path.secondTopic; // there is a further path segment so some global link is open

  let openGlobalLinkTargetTopic = path.secondTopic;
  let openGlobalLinkTargetSubtopic = openGlobalLinkTargetTopic;

  // Is the given global link's target the same as the next path segment's topic?
  let thisGlobalLinkIsPointingToTheRightThingToBeOpen =
    link.targetTopic.mixedCase === openGlobalLinkTargetTopic?.mixedCase &&
    link.targetSubtopic.mixedCase === openGlobalLinkTargetSubtopic?.mixedCase;

  // Is this global link in the currently visible lowest subtopic of the given topic?
  let thisGlobalLinkIsInCorrectSubtopicToBeOpen = currentlyRenderingSubtopic.mixedCase ===
    subtopicOfPathContainingOpenGlobalReference.mixedCase;

  return openGlobalLinkExists &&
    thisGlobalLinkIsPointingToTheRightThingToBeOpen &&
    thisGlobalLinkIsInCorrectSubtopicToBeOpen;
}

export default renderDomTree;
