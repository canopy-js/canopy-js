import requestJson from 'requests/request_json';
import { canopyContainer, domElementOfBlock } from 'helpers/getters';
import renderDomTree from 'render/render_dom_tree';
import displayPathTo from 'display/display_path_to';
import eagerLoadOnGlobalReference from 'display/eager_load_on_external_reference';
import setPathAndFragment from 'helpers/set_path_and_fragment';

const displayTopic = (topicName, subtopicName) => {
  if(!topicName){ throw 'Topic name required'; }
  // Check network cache (and render cache?)
  setPathAndFragment(topicName, subtopicName);
  requestJson(topicName, function(dataObject) {
    const paragraphTokensBySubtopic = dataObject;

    var headerTextNode = document.createTextNode(topicName)
    var headerDomElement = document.createElement('h1');
    headerDomElement.appendChild(headerTextNode);
    canopyContainer.appendChild(headerDomElement);

    const domTree = renderDomTree(
      topicName,
      paragraphTokensBySubtopic,
      eagerLoadOnGlobalReference
    );
    canopyContainer.appendChild(domTree);
    const selectedElement = domElementOfBlock(topicName, subtopicName);
    displayPathTo(selectedElement);
  });
}

export default displayTopic;
