import requestJson from 'requests/request_json';
import { canopyContainer } from 'helpers/getters';
import renderDomTree from 'render/render_dom_tree';
import displayPath from 'display/display_path'
import { sectionElementOfTopic, findLinkFromMetadata } from 'helpers/getters';
import { firstLinkOfSection } from 'helpers/relationships';
import { defaultTopic } from 'helpers/getters';
import setPathAndFragment from 'path/set_path';

const renderTopic = (pathArray, selectedLinkData, selectFirstLink, anchorElement) => {
  var topicName = pathArray[0][0];
  var subtopicName = pathArray[0][1];

  var existingSectionElement = sectionElementOfTopic(topicName, subtopicName);

  if (existingSectionElement) {
    createOrReplaceHeader(topicName);
    return displayPath(
      pathArray,
      selectedLinkData && findLinkFromMetadata(selectedLinkData),
      selectFirstLink
    );
  }

  requestJson(topicName, function(dataObject) {
    var paragraphsBySubtopic = dataObject;

    createOrReplaceHeader(topicName);

    const domTree = renderDomTree(
      pathArray[0][0],
      pathArray,
      '',
      paragraphsBySubtopic,
      [],
      {}
    );

    (anchorElement || canopyContainer).appendChild(domTree);

    displayPath(
      pathArray,
      selectedLinkData && findLinkFromMetadata(selectedLinkData),
      selectFirstLink
    );
  }, (e) => {
    renderTopic([[defaultTopic, defaultTopic]], null);
  });
}

function createOrReplaceHeader(topicName) {
  var existingHeader = document.querySelector('#_canopy h1')
  if (existingHeader) { existingHeader.remove(); }

  var headerTextNode = document.createTextNode(topicName)
  var headerDomElement = document.createElement('h1');
  headerDomElement.appendChild(headerTextNode);
  canopyContainer.prepend(headerDomElement);
};

export default renderTopic;
