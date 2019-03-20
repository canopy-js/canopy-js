import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';

const fetchAndRenderPath = (pathArray, pathDepth) => {
  if (pathArray.length === 0) {
    return Promise.resolve(null);
  }
  let topicName = pathArray[0][0];
  let uponResponsePromise = requestJson(topicName);

  let promisedDomTree = uponResponsePromise.then((dataObject) => {
    let { paragraphsBySubtopic, topicDisplayName } = dataObject;

    return renderDomTree(
      {
        topicName: pathArray[0][0],
        topicDisplayName: topicDisplayName,
        subtopicName: pathArray[0][0],
        pathArray,
        paragraphsBySubtopic,
        subtopicsAlreadyRendered: {},
        pathDepth
      }
    );
  })

  return promisedDomTree.then((domTree) => {
    pathDepth > 0 && domTree.prepend(document.createElement('hr'));
    return domTree;
  });
}

export default fetchAndRenderPath;
