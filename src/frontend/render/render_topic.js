import requestJson from 'requests/request_json';
import { canopyContainer } from 'helpers/getters';
import renderDomTree from 'render/render_dom_tree';
import eagerLoadOnGlobalReference from 'display/eager_load_on_external_reference';
import displayPathTo from 'display/display_path_to';
import setPathAndFragment from 'helpers/set_path_and_fragment';
import { sectionElementOfTopic } from 'helpers/getters';

const renderTopic = (topicName, subtopicName) => {
  if(!topicName){ throw 'Topic name required'; }
  // Check network cache (and render cache?)
  requestJson(topicName, function(dataObject) {
    var paragraphsBySubtopic = dataObject;

    var headerTextNode = document.createTextNode(topicName)
    var headerDomElement = document.createElement('h1');
    headerDomElement.appendChild(headerTextNode);
    canopyContainer.appendChild(headerDomElement);

    const domTree = renderDomTree(
      topicName,
      topicName,
      paragraphsBySubtopic,
      eagerLoadOnGlobalReference,
      [],
      {}
    );

    canopyContainer.appendChild(domTree);

    setPathAndFragment(topicName, subtopicName);
    const selectedElement = sectionElementOfTopic(topicName, subtopicName);
    displayPathTo(selectedElement);
  });
}

export default renderTopic;
