import requestJson from 'requests/request_json';
import { canopyContainer } from 'helpers/getters';
import renderDomTree from 'render/render_dom_tree';
import eagerLoadOnGlobalReference from 'display/eager_load_on_external_reference';

const renderTopic = (topicName, subtopicName) => {
  if(!topicName){ throw 'Topic name required'; }
  // Check network cache (and render cache?)
  requestJson(topicName, function(dataObject) {
    var remainingTokenizedParagraphsBySubtopic = dataObject;

    var headerTextNode = document.createTextNode(topicName)
    var headerDomElement = document.createElement('h1');
    headerDomElement.appendChild(headerTextNode);
    canopyContainer.appendChild(headerDomElement);

    const domTree = renderDomTree(
      topicName,
      remainingTokenizedParagraphsBySubtopic,
      eagerLoadOnGlobalReference,
      []
    );
    canopyContainer.appendChild(domTree);
  });
}

export default renderTopic;
