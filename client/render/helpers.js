import Topic from '../../cli/shared/topic';
import renderTokenElements from './render_token_element';

function generateHeader(topicTokens, displayTopicName) {
  let topic = new Topic(displayTopicName);

  let previousHeader = document.querySelector(`h1[data-topic-name="${topic.cssMixedCase}"]`);
  if (previousHeader) return previousHeader;

  let headerElement = document.createElement('h1');
  headerElement.dataset.topicName = topic.mixedCase;
  headerElement.style.display = 'none';
  headerElement.classList.add('canopy-header');

  topicTokens.forEach(token => {
    let elements = renderTokenElements(token);
    elements.forEach(element => headerElement.appendChild(element));
  });

  return headerElement
}

export { generateHeader };
