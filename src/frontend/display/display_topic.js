import requestJson from 'requests/request_json';
import { canopyContainer, domElementOfTopic } from 'helpers/getters';
import renderDomTree from 'render/render_dom_tree';
import displayPathTo from 'display/display_path_to';
import eagerLoadOnExternalReference from 'display/eager_load_on_external_reference';

const displayTopic = (topicName, subtopicName) => {
  // Check cache
  requestJson(topicName, function(dataObject) {
    const paragraphTokensBySubtopic = dataObject;
    const domTree = renderDomTree(
      topicName,
      paragraphTokensBySubtopic,
      eagerLoadOnExternalReference
    );
    canopyContainer.appendChild(domTree);
    const selectedElement = domElementOfTopic(topicName, subtopicName);
    displayPathTo(selectedElement);
  });
}

export default displayTopic;
