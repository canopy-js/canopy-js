import requestJson from 'requests/request_json';
import { canopyContainer } from 'helpers/getters';
import renderDomTree from 'render/render_dom_tree';
import eagerLoadOnGlobalReference from 'display/eager_load_on_external_reference';
import displayPath from 'display/display_path'
import { sectionElementOfTopic } from 'helpers/getters';
import { firstLinkOfSection } from 'keys/relationships';
import { defaultTopic } from 'helpers/getters';
import setPathAndFragment from 'helpers/set_path_and_fragment';

const renderTopic = (topicName, subtopicName, selectFirstLink) => {
  var existingSectionElement = sectionElementOfTopic(topicName, subtopicName)
  if(existingSectionElement) {
    createOrReplaceHeader(topicName);
    displayPath(topicName, subtopicName, selectFirstLink ? firstLinkOfSection(existingSectionElement) : null);
    return;
  }

  requestJson(topicName, function(dataObject) {
    var paragraphsBySubtopic = dataObject;

    createOrReplaceHeader(topicName);

    const domTree = renderDomTree(
      topicName,
      topicName,
      paragraphsBySubtopic,
      eagerLoadOnGlobalReference,
      [],
      {}
    );

    canopyContainer.appendChild(domTree);

    displayPath(topicName, subtopicName, selectFirstLink ? firstLinkOfSection(domTree) : null);
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
