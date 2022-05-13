import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';
import { alreadyPresentNode } from 'display/helpers';
import { sectionElementOfRelativePath } from 'helpers/getters';

const fetchAndRenderPath = (pathArray, parentElement) => {
  if (pathArray.length === 0) {
    return Promise.resolve(null);
  }

  let topicName = pathArray[0][0];
  let pathDepth = Number(parentElement.dataset.pathDepth) + 1 || 0;

  let preexistingNode = sectionElementOfRelativePath(parentElement, [pathArray[0]]);
  if (preexistingNode) {
    let newPathArray = pathArray.slice(1);
    return fetchAndRenderPath(newPathArray, preexistingNode);
  }

  let uponResponsePromise = requestJson(topicName);

  let uponTreeRender = uponResponsePromise.then(({ paragraphsBySubtopic, displayTopicName }) => {
    return renderDomTree(
      {
        topicName: pathArray[0][0],
        displayTopicName: displayTopicName,
        subtopicName: pathArray[0][0],
        pathArray,
        paragraphsBySubtopic,
        subtopicsAlreadyRendered: {},
        pathDepth
      }
    );
  });

  return uponTreeRender.then((domTree) => {
    if (domTree) { // null if parent was leaf node
      parentElement.appendChild(domTree);
    }
  });
}

export default fetchAndRenderPath;
