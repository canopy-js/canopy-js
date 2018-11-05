import { htmlIdFor } from 'helpers/identifiers';
import displayPath from 'display/display_path';
import setPathAndFragment from 'helpers/set_path_and_fragment';
import { slugFor } from 'helpers/identifiers';
import { linkNumberOf } from 'helpers/getters';
import renderTopic from 'render/render_topic'

const renderDomTree = (topicName, subtopicName, paragraphsBySubtopic, currentTopicStack, renderedSubtopics) => {
  var sectionElement = document.createElement('section');
  var paragraphElement = document.createElement('p');

  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.id = htmlIdFor(topicName, subtopicName);
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.subtopicName = subtopicName;

  var linesOfBlock = paragraphsBySubtopic[subtopicName];
  currentTopicStack.push(topicName);
  renderedSubtopics[subtopicName] = true;

  linesOfBlock.forEach((tokensOfLine, lineNumber) => {
    if (lineNumber > 0) {
      paragraphElement.appendChild(document.createElement('br'));
    }

    tokensOfLine.forEach(token => {
      var tokenElement;
      var textElement = document.createTextNode(token.text);
      if(token.type === 'text' || currentTopicStack.includes(token.targetSubtopic)) {
        tokenElement = textElement;
      } else if (token.type === 'local') {
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);

        if (!renderedSubtopics.hasOwnProperty(token.targetSubtopic)) {
          var subtree = renderDomTree(
            topicName,
            token.targetSubtopic,
            paragraphsBySubtopic,
            currentTopicStack,
            renderedSubtopics
          );

          tokenElement.addEventListener('click', (e) => {
            e.preventDefault();
            // If the link's child is already selected, display the link's section
            if (document.querySelector('.canopy-selected-section') === subtree) {

              displayPath(
                linkElement.dataset.topicName,
                linkElement.dataset.enclosingSubtopic
              );
            } else {
              displayPath(
                topicName,
                token.targetSubtopic,
              );
            }
          });

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
          tokenElement.dataset.clauseText = token.clause;
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
          tokenElement.dataset.clauseText = token.clause;
          tokenElement.href = `/${slugFor(topicName)}#${slugFor(token.enclosingSubtopic)}`;
          tokenElement.addEventListener('click', (e) => {
            e.preventDefault();
            displayPath(
              topicName,
              token.targetSubtopic
            );
          });
        }
      } else if (token.type === 'global') {
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);
        tokenElement.classList.add('canopy-global-link');
        tokenElement.dataset.type = 'global';
        tokenElement.dataset.targetTopic = token.targetTopic;
        tokenElement.dataset.targetSubtopic = token.targetSubtopic;
        tokenElement.dataset.urlSubtopic = token.enclosingSubtopic;
        tokenElement.dataset.enclosingTopic = token.enclosingTopic;
        tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
        tokenElement.dataset.clauseText = token.clause;
        tokenElement.href = `/${slugFor(token.topic)}#${slugFor(token.urlSubtopic)}`;
        tokenElement.addEventListener('click', (e) => {
          e.preventDefault();
          renderTopic(
            token.targetTopic,
            token.targetSubtopic
          );
        });
      }
      paragraphElement.appendChild(tokenElement);
    });
  });

  currentTopicStack.pop(topicName);
  return sectionElement;
}

export default renderDomTree;
