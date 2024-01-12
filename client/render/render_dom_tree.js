import fetchAndRenderPath from 'render/fetch_and_render_path';
import requestJson from 'requests/request_json';
import Paragraph from 'models/paragraph';
import Link from 'models/link';
import Topic from '../../cli/shared/topic';
import renderTokenElement from 'render/render_token_element';

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
    let element = renderTokenElement(token, renderContext);
    paragraph.paragraphElement.appendChild(element);
  });

  return sectionElement;
}

function localLinkSubtreeCallback(topic, sectionElement, renderContext) {
  return (token) => {
    let childSectionElement = renderDomTree(
      topic,
      Topic.fromMixedCase(token.targetSubtopic),
      Object.assign({}, renderContext)
    );

    sectionElement.appendChild(childSectionElement);
  }
}

function createSectionElement(topic, subtopic, renderContext) {
  let {
    displayTopicName, pathDepth, paragraphsBySubtopic
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
  let tokens = paragraphsBySubtopic[topic.mixedCase];

  if (topic.mixedCase === subtopic.mixedCase) {
    if (pathDepth > 0 && tokens.length > 0) sectionElement.prepend(document.createElement('hr'));
    sectionElement.classList.add('canopy-topic-section');
  }

  return sectionElement;
}

export default renderDomTree;
