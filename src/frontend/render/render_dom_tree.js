const renderDomTree = (topicName, paragraphTokensBySubtopic, onExternalReference) => {
  var sectionElement = document.createElement('sectionElement');
  var paragraphElement = document.createElement('p');
  sectionElement.appendChild(paragraphElement);
  // sectionElement.style.display = 'none';

  var linesOfFirstBlock = paragraphTokensBySubtopic[topicName];
  linesOfFirstBlock.forEach(tokensOfLine => {
    tokensOfLine.forEach(token => {
      var textNode = document.createTextNode(token.text);
      paragraphElement.appendChild(textNode);
    });
    paragraphElement.appendChild(document.createElement('br'));
  });

  return sectionElement;
}

export default renderDomTree;
