import { htmlIdFor } from 'helpers/identifiers';
import displayPath from 'display/display_path';
import setPathAndFragment from 'path/set_path';
import { slugFor } from 'helpers/identifiers';
import { linkNumberOf } from 'helpers/getters';
import fetchAndRenderPath from 'render/fetch_and_render_path';
import { onParentLinkClick, onGlobalLinkClick } from 'render/click_handlers';

const renderTopicDomTree = (currentSubtopicName, pathArray, paragraphsBySubtopic, currentTopicStack, renderedSubtopics, pathDepth) => {
  var topicName = pathArray[0][0];
  var subtopicContainingConvertedGlobalReference = pathArray[0][1];
  var convertedGlobalLinkExists = pathArray[1];
  var convertedGlobalLinkTargetTopic = pathArray[1] && pathArray[1][0];
  var convertedGlobalLinkTargetSubtopic = pathArray[1] && pathArray[1][1];

  var sectionElement = document.createElement('section');
  var paragraphElement = document.createElement('p');

  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.subtopicName = currentSubtopicName;
  sectionElement.dataset.pathDepth = pathDepth;

  var linesOfBlock = paragraphsBySubtopic[currentSubtopicName];
  currentTopicStack.push(topicName);
  renderedSubtopics[currentSubtopicName] = true;

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
          var subtree = renderTopicDomTree(
            token.targetSubtopic,
            pathArray,
            paragraphsBySubtopic,
            currentTopicStack,
            renderedSubtopics,
            pathDepth
          );

          tokenElement.addEventListener('click', onParentLinkClick(topicName, tokenElement, token.targetSubtopic));

          tokenElement.classList.add('canopy-parent-link');
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

        var globalLinkIsConverted = convertedGlobalLinkExists &&
          tokenElement.dataset.targetTopic === convertedGlobalLinkTargetTopic &&
          tokenElement.dataset.targetSubtopic === convertedGlobalLinkTargetSubtopic &&
          currentSubtopicName === subtopicContainingConvertedGlobalReference;

        if (globalLinkIsConverted) {
          tokenElement.classList.add('canopy-converted-global-link');
          tokenElement.addEventListener('click', onParentLinkClick(topicName, tokenElement, token.targetSubtopic));

          var whenDomRenders = fetchAndRenderPath(pathArray.slice(1), pathDepth + 1);
          whenDomRenders.then((topicDomTree) => {
            sectionElement.appendChild(topicDomTree);
          });
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

export default renderTopicDomTree;
