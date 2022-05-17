import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';

const fetchAndRenderPath = (path, parentElement, eagerRenderGlobalChildren) => {
  if (path.length === 0) {
    return Promise.resolve(null);
  }

  let preexistingNode = path.firstSegment.relativeSectionElement(parentElement);
  if (preexistingNode) {
    let newPath = path.withoutFirstSegment;
    return fetchAndRenderPath(newPath, preexistingNode);
  }

  let uponResponsePromise = requestJson(path.firstTopic);

  let uponTreeRender = uponResponsePromise.then(({ paragraphsBySubtopic, displayTopicName }) => {
    return renderDomTree(
      {
        topicName: path.firstTopic,
        subtopicName: path.firstTopic,
        path,
        displayTopicName: displayTopicName,
        paragraphsBySubtopic,
        subtopicsAlreadyRendered: {},
        pathDepth: Number(parentElement.dataset.pathDepth) + 1 || 0,
        eagerRenderGlobalChildren
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
