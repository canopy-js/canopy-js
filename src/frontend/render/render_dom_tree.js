import { htmlIdFor } from 'helpers/identifiers';
import displaySubtopic from 'display/display_subtopic';
import setPathAndFragment from 'helpers/set_path_and_fragment';

const renderDomTree = (topicName, subtopicName, paragraphsBySubtopic, onGlobalReference, currentTopicStack, renderedSubtopics) => {
  var sectionElement = document.createElement('section');
  var paragraphElement = document.createElement('p');

  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.id = htmlIdFor(topicName, subtopicName);
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.subtopicName = subtopicName;

  var linesOfBlock = paragraphsBySubtopic[subtopicName];
  currentTopicStack.push(topicName);
  renderedSubtopics[topicName] = true;

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

        // TODO: and if we aren't in a parenthetical remark
        if (!renderedSubtopics.hasOwnProperty(token.key)) {
          var subtree = renderDomTree(
            topicName,
            token.key,
            paragraphsBySubtopic,
            onGlobalReference,
            currentTopicStack,
            renderedSubtopics
          );

          tokenElement.addEventListener('click', () => {
            // If the link's child is already selected, display the link's section
            if (document.querySelector('.canopy-selected-section') === subtree) {
              setPathAndFragment(
                sectionElement.dataset.topicName,
                sectionElement.dataset.subtopicName
              );
            } else {
              setPathAndFragment(topicName, token.key);
            }
          });

          var id = htmlIdFor(topicName, token.key);
          tokenElement.classList.add(id);
          tokenElement.classList.add('canopy-parent-link');
          tokenElement.dataset.id = id;

          sectionElement.appendChild(subtree);
        } else {

        }
      } else if (token.type === 'import') {
        // Trigger eager load of that page
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);
        tokenElement.classList.add('canopy-alias-link');
        tokenElement.addEventListener('click', () => {
          setPathAndFragment(token.context, token.key);
        });

      } else if (token.type === 'global') {
        // Trigger eager load of that page
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);
        tokenElement.classList.add('canopy-alias-link');
        tokenElement.addEventListener('click', () => {
          setPathAndFragment(token.key, token.key);
        });

        onGlobalReference(token.key); // TODO: rename .key to .topic or something
      }
      paragraphElement.appendChild(tokenElement);
    });
  });

  currentTopicStack.pop(topicName);
  return sectionElement;
}

export default renderDomTree;
