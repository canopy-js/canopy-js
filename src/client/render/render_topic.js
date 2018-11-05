import requestJson from 'requests/request_json';
import { canopyContainer } from 'helpers/getters';
import renderDomTree from 'render/render_dom_tree';
import displayPath from 'display/display_path'
import { sectionElementOfTopic, findLinkFromMetadata } from 'helpers/getters';
import { firstLinkOfSection } from 'helpers/relationships';
import { defaultTopic } from 'helpers/getters';
import setPathAndFragment from 'helpers/set_path_and_fragment';

const renderTopic = (topicName, selectedSubtopicName, selectedLinkData, selectFirstLink) => {
  var existingSectionElement = sectionElementOfTopic(topicName, selectedSubtopicName)

  if (existingSectionElement) {
    createOrReplaceHeader(topicName);
    return displayPath(
      topicName,
      selectedSubtopicName,
      selectedLinkData && findLinkFromMetadata(selectedLinkData),
      selectFirstLink
    );
  }

  requestJson(topicName, function(dataObject) {
    var paragraphsBySubtopic = dataObject;

    createOrReplaceHeader(topicName);

    const domTree = renderDomTree(
      topicName,
      topicName,
      paragraphsBySubtopic,
      [],
      {}
    );

    canopyContainer.appendChild(domTree);

    displayPath(
      topicName,
      selectedSubtopicName,
      selectedLinkData && findLinkFromMetadata(selectedLinkData),
      selectFirstLink
    );
  }, (e) => {
    setPathAndFragment(defaultTopic, null);
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
