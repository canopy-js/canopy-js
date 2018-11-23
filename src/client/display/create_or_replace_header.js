import { canopyContainer } from 'helpers/getters';

function createOrReplaceHeader(topicName) {
  var existingHeader = document.querySelector('#_canopy h1')
  if (existingHeader) { existingHeader.remove(); }

  var headerTextNode = document.createTextNode(topicName)
  var headerDomElement = document.createElement('h1');
  headerDomElement.appendChild(headerTextNode);
  canopyContainer.prepend(headerDomElement);
};

export default createOrReplaceHeader;
