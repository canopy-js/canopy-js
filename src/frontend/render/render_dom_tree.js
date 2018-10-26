import { htmlIdFor } from 'helpers/identifiers';

const renderDomTree = (topicName, subtopicName, paragraphsBySubtopic, onGlobalReference, currentTopicStack, renderedSubtopics) => {
  var sectionElement = document.createElement('section');
  var paragraphElement = document.createElement('p');

  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.id = htmlIdFor(topicName, subtopicName);

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
        // Check if referee has already been rendered
        // If no, go render and make this a parent link
        // If yes, make this a local redirect
        // Should be the same if you go through fragment url

        if (!renderedSubtopics.hasOwnProperty(token.key)) {
          // If the subtopic referenced here hasn't already been rendered it,
          // render it and append the section element here
          // Otherwise, just create the link but don't render the section element
          //
          var subtree = renderDomTree(
            topicName,
            token.key,
            paragraphsBySubtopic,
            onGlobalReference,
            currentTopicStack,
            renderedSubtopics
          );

          tokenElement.classList.add(htmlIdFor(topicName, token.key));

          sectionElement.appendChild(subtree);
        } else {

        }
      } else if (token.type === 'import') {
        // Trigger eager load of that page
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);
        tokenElement.classList.add('canopy-alias-link');
      } else if (token.type === 'global') {
        // Trigger eager load of that page
        tokenElement = document.createElement('a');
        tokenElement.appendChild(textElement);
        tokenElement.classList.add('canopy-alias-link');

        onGlobalReference(token.key); // TODO: rename .key to .topic or something
      }
      paragraphElement.appendChild(tokenElement);
    });
  });

  currentTopicStack.pop(topicName);
  return sectionElement;
}

export default renderDomTree;
