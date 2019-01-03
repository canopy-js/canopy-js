import { canopyContainer } from 'helpers/getters';

function createOrReplaceHeader(topicName) {
  let existingHeader = document.querySelector('#_canopy h1')
  if (existingHeader) { existingHeader.remove(); }

  let headerTextNode = document.createTextNode(topicName)
  let headerDomElement = document.createElement('h1');
  headerDomElement.appendChild(headerTextNode);
  canopyContainer.prepend(headerDomElement);
};

export default createOrReplaceHeader;
