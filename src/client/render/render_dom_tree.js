import { htmlIdFor } from 'helpers/identifiers';
import displayPath from 'display/display_path';
import setPathAndFragment from 'path/set_path';
import { slugFor } from 'helpers/identifiers';
import { linkNumberOf } from 'helpers/getters';
import fetchAndRenderPath from 'render/fetch_and_render_path';
import { onParentLinkClick, onGlobalLinkClick } from 'render/click_handlers';

const renderDomTree = (currentSubtopicName, pathArray, paragraphsBySubtopic, currentTopicStack, renderedSubtopics, pathDepth) => {
  let topicName = pathArray[0][0];
  let subtopicContainingOpenGlobalReference = pathArray[0][1];
  let openGlobalLinkExists = pathArray[1];
  let openGlobalLinkTargetTopic = pathArray[1] && pathArray[1][0];
  let openGlobalLinkTargetSubtopic = openGlobalLinkTargetTopic;
  let promises = [];

  let sectionElement = document.createElement('section');
  let paragraphElement = document.createElement('p');

  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.subtopicName = currentSubtopicName;
  sectionElement.dataset.pathDepth = pathDepth;

  let linesOfBlock = paragraphsBySubtopic[currentSubtopicName];
  currentTopicStack.push(topicName);
  renderedSubtopics[currentSubtopicName] = true;

  linesOfBlock.forEach((tokensOfLine, lineNumber) => {
    if (lineNumber > 0) {
      paragraphElement.appendChild(document.createElement('br'));
    }

    tokensOfLine.forEach(token => {
      let tokenElement;
      let textElement = document.createTextNode(token.text);

      if (token.type === 'text' || currentTopicStack.includes(token.targetSubtopic)) {
        tokenElement = textElement;

      } else if (token.type === 'local') {
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);

        if (!renderedSubtopics.hasOwnProperty(token.targetSubtopic)) {
          let promisedSubtree = renderDomTree(
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

          promisedSubtree.then((subtree) => {
            sectionElement.appendChild(subtree);
          });

          promises.push(promisedSubtree);
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

        let globalLinkIsOpen = openGlobalLinkExists &&
          tokenElement.dataset.targetTopic === openGlobalLinkTargetTopic &&
          tokenElement.dataset.targetSubtopic === openGlobalLinkTargetSubtopic &&
          currentSubtopicName === subtopicContainingOpenGlobalReference &&
          !sectionElement.querySelector(
            `a[data-target-topic="${tokenElement.dataset.targetTopic}"]` +
            `[data-target-subtopic="${tokenElement.dataset.targetSubtopic}"]`
          );

        if (globalLinkIsOpen) {
          let whenDomRenders = fetchAndRenderPath(pathArray.slice(1), pathDepth + 1);
          let whenElementAppended = whenDomRenders.then((domTree) => {
            sectionElement.appendChild(domTree);
          });

          promises.push(whenElementAppended);
        } else {
          tokenElement.addEventListener('click', onGlobalLinkClick(token.targetTopic, token.targetSubtopic, tokenElement));
        }
      }
      paragraphElement.appendChild(tokenElement);
    });
  });

  currentTopicStack.pop(topicName);

  return Promise.all(promises).then((_) => {
    return sectionElement;
  });
}

export default renderDomTree;
