import Topic from '../../cli/commands/shared/topic';
import renderTokenElement from './render_token_element';

function generateHeader(topicTokens, displayTopicName) {
  let topic = new Topic(displayTopicName);

  let headerElement = document.createElement('h1');
  headerElement.dataset.topicName = topic.mixedCase;

  topicTokens.forEach(token => {
    let element = renderTokenElement(token);
    headerElement.appendChild(element);
  });

  return headerElement
}

export { generateHeader };
