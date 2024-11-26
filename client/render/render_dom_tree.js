import Paragraph from 'models/paragraph';
import Topic from '../../cli/shared/topic';
import renderTokenElements from 'render/render_token_element';

function renderDomTree(topic, subtopic, renderContext) {
  let { paragraphsBySubtopic } = renderContext;

  let sectionElement = createSectionElement(topic, subtopic, renderContext);
  let paragraph = new Paragraph(sectionElement);

  renderContext.localLinkSubtreeCallback = localLinkSubtreeCallback(topic, sectionElement, renderContext);

  let tokensOfParagraph = paragraphsBySubtopic[subtopic.mixedCase];
  if (!tokensOfParagraph) throw new Error(`Paragraph with subtopic not found: ${subtopic.mixedCase}`);

  renderContext.currentTopic = topic;
  renderContext.currentSubtopic = subtopic;

  tokensOfParagraph.forEach((token) => {
    let elements = renderTokenElements(token, renderContext);
    elements.forEach(element => paragraph.paragraphElement.appendChild(element));
  });

  return sectionElement;
}

function localLinkSubtreeCallback(topic, parentSectionElement, renderContext) {
  return (token) => {
    let { fullPath, remainingPath } = renderContext;
    let newSubtopic = Topic.fromMixedCase(token.targetSubtopic);
    let pathToEnclosingTopic = fullPath.slice(0, fullPath.length - remainingPath.length);
    let pathToParagaph = pathToEnclosingTopic.addSegment(topic, newSubtopic);

    let childSectionElement = renderDomTree(
      topic,
      Topic.fromMixedCase(token.targetSubtopic),
      Object.assign({ pathToParagaph }, renderContext)
    );

    parentSectionElement.appendChild(childSectionElement);
  }
}

function createSectionElement(topic, subtopic, renderContext) {
  let {
    displayTopicName, pathDepth, paragraphsBySubtopic, pathToParagraph
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
  sectionElement.topicName = topic.mixedCase; // helpful to have in debugger
  sectionElement.dataset.subtopicName = subtopic.mixedCase;
  sectionElement.subtopicName = subtopic.mixedCase; // helpful to have in debugger
  sectionElement.dataset.pathDepth = pathDepth;
  sectionElement.dataset.pathString = pathToParagraph.replaceTerminalSubtopic(subtopic).string;

  let tokens = paragraphsBySubtopic[topic.mixedCase];

  if (Topic.areEqual(topic, subtopic)) {
    let hr = document.createElement('hr')
    hr.classList.add('canopy-hr');
    if (pathDepth > 0 && tokens.length > 0) sectionElement.prepend(hr);
    sectionElement.classList.add('canopy-topic-section');
  }

  return sectionElement;
}

export default renderDomTree;
