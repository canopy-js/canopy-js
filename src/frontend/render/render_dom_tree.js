const renderDomTree = (topicName, paragraphTokensBySubtopic, onExternalReference) => {
  var section = document.createElement('section');
  var paragraph = document.createElement('p');
  section.appendChild(paragraph);
  section.style.display = 'none';

  return section;
}

export default renderDomTree;
