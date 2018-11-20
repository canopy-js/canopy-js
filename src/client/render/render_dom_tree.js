import { htmlIdFor } from 'helpers/identifiers';
import displayPath from 'display/display_path';
import setPathAndFragment from 'path/set_path';
import { slugFor } from 'helpers/identifiers';
import { linkNumberOf } from 'helpers/getters';
import renderTopic from 'render/render_topic';
import { onParentLinkClick, onGlobalLinkClick } from 'render/click_handlers';

const renderDomTree = (subtopicToRender, pathArray, idPrefix, paragraphsBySubtopic, currentTopicStack, renderedSubtopics) => {
  var topicName = pathArray[0][0];
  var subtopicContainingConvertedParentLink = pathArray[0][1];
  var nextTopicName = pathArray[1] && pathArray[1][0];
  var nextSubtopicName = pathArray[1] && pathArray[1][1];

  var sectionElement = document.createElement('section');
  var paragraphElement = document.createElement('p');

  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.id = htmlIdFor(topicName, subtopicToRender);
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.subtopicName = subtopicToRender;

  var linesOfBlock = paragraphsBySubtopic[subtopicToRender];
  currentTopicStack.push(topicName);
  renderedSubtopics[subtopicToRender] = true;

  linesOfBlock.forEach((tokensOfLine, lineNumber) => {
    if (lineNumber > 0) {
      paragraphElement.appendChild(document.createElement('br'));
    }

    tokensOfLine.forEach(token => {
      var tokenElement;
      var textElement = document.createTextNode(token.text);

      if (token.type === 'text' || currentTopicStack.includes(token.targetSubtopic)) {
        tokenElement = textElement;

      } else if (token.type === 'local') {
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);

        if (!renderedSubtopics.hasOwnProperty(token.targetSubtopic)) {
          var subtree = renderDomTree(
            token.targetSubtopic,
            pathArray,
            idPrefix,
            paragraphsBySubtopic,
            currentTopicStack,
            renderedSubtopics
          );

          tokenElement.addEventListener('click', onParentLinkClick(topicName, tokenElement, token.targetSubtopic));

          var id = htmlIdFor(topicName, token.targetSubtopic);
          tokenElement.classList.add(id);
          tokenElement.classList.add('canopy-parent-link');
          tokenElement.dataset.childSectionId = id;
          tokenElement.dataset.type = 'parent';
          tokenElement.dataset.targetTopic = topicName;
          tokenElement.dataset.targetSubtopic = token.targetSubtopic;
          tokenElement.dataset.urlSubtopic = token.targetSubtopic;
          tokenElement.dataset.enclosingTopic = token.enclosingTopic;
          tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
          tokenElement.href = `/${slugFor(topicName)}#${slugFor(token.targetSubtopic)}`;

          sectionElement.appendChild(subtree);
        } else {
          tokenElement.classList.add('canopy-redundant-parent-link');
          tokenElement.dataset.type = 'redundant-parent';
          tokenElement.dataset.targetTopic = topicName;
          tokenElement.dataset.targetSubtopic = token.targetSubtopic;
          tokenElement.dataset.enclosingTopic = token.enclosingTopic;
          tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
          tokenElement.dataset.urlSubtopic = token.enclosingSubtopic;
          tokenElement.href = `/${slugFor(topicName)}#${slugFor(token.enclosingSubtopic)}`;
          tokenElement.addEventListener('click', onParentLinkClick(topicName, tokenElement, token.targetSubtopic));
        }
      } else if (token.type === 'global') {
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);
        tokenElement.dataset.type = 'global';
        tokenElement.dataset.targetTopic = token.targetTopic;
        tokenElement.dataset.targetSubtopic = token.targetSubtopic;
        tokenElement.dataset.urlSubtopic = token.enclosingSubtopic;
        tokenElement.dataset.enclosingTopic = token.enclosingTopic;
        tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
        tokenElement.classList.add('canopy-global-link');
        tokenElement.href = `/${slugFor(token.targetTopic)}#${slugFor(token.targetSubtopic)}`;

        var convertedGlobalLink = pathArray[1] &&
          tokenElement.dataset.targetTopic === pathArray[1][0] &&
          tokenElement.dataset.targetSubtopic === pathArray[1][1];

        if (convertedGlobalLink) {
          tokenElement.classList.add('canopy-converted-global-link');
          tokenElement.addEventListener('click', onParentLinkClick(topicName, tokenElement, token.targetSubtopic));
        } else {
          tokenElement.addEventListener('click', onGlobalLinkClick(token.targetTopic, token.targetSubtopic));
        }
      }
      paragraphElement.appendChild(tokenElement);
    });
  });

  currentTopicStack.pop(topicName);
  return sectionElement;
}

export default renderDomTree;
