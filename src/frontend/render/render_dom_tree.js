import { htmlIdFor } from 'helpers/identifiers';
import displayPath from 'display/display_path';
import setPathAndFragment from 'helpers/set_path_and_fragment';
import { slugFor } from 'helpers/identifiers';
import { linkNumberOf } from 'helpers/getters';

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
      if(token.type === 'text' || currentTopicStack.includes(token.key)) {
        tokenElement = textElement;
      } else if (token.type === 'local') {
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);
        tokenElement.href = `/${slugFor(topicName)}#${slugFor(token.key)}`;

        if (!renderedSubtopics.hasOwnProperty(token.key)) {
          var subtree = renderDomTree(
            topicName,
            token.key,
            paragraphsBySubtopic,
            currentTopicStack,
            renderedSubtopics
          );

          tokenElement.addEventListener('click', (e) => {
            e.preventDefault();
            // If the link's child is already selected, display the link's section
            if (document.querySelector('.canopy-selected-section') === subtree) {
              setPathAndFragment(
                sectionElement.dataset.topicName,
                sectionElement.dataset.subtopicName,
                linkNumberOf(tokenElement)
              );
            } else {
              setPathAndFragment(topicName, token.key, linkNumberOf(tokenElement));
            }
          });

          var id = htmlIdFor(topicName, token.key);
          tokenElement.classList.add(id);
          tokenElement.classList.add('canopy-parent-link');
          tokenElement.dataset.childSectionId = id;
          tokenElement.dataset.type = 'parent';
          tokenElement.dataset.childTopicName = topicName;
          tokenElement.dataset.childSubtopicName = token.key;

          sectionElement.appendChild(subtree);
        } else {
          tokenElement.classList.add('canopy-redundant-parent-link');
          tokenElement.dataset.topicName = token.context;
          tokenElement.dataset.subtopicName = token.key;
          tokenElement.dataset.type = 'redundant-parent';
          tokenElement.addEventListener('click', (e) => {
            e.preventDefault();
            setPathAndFragment(topicName, token.key);
          });
        }
      } else if (token.type === 'global') {
        // Trigger eager load of that page
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);
        tokenElement.classList.add('canopy-global-link');
        tokenElement.dataset.topicName = token.context;
        tokenElement.dataset.subtopicName = token.key;
        tokenElement.dataset.type = 'global';
        tokenElement.href = `/${slugFor(token.context)}#${slugFor(token.key)}`;
        tokenElement.addEventListener('click', (e) => {
          e.preventDefault();
          setPathAndFragment(token.context, token.key, linkNumberOf(tokenElement));
        });
      }
      paragraphElement.appendChild(tokenElement);
    });
  });

  currentTopicStack.pop(topicName);
  return sectionElement;
}

export default renderDomTree;
