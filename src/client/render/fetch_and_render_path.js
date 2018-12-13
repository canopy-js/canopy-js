import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';

const fetchAndRenderPath = (pathArray, pathDepth) => {
  if (pathArray.length === 0) {
    return Promise.resolve(null);
  }

  var topicName = pathArray[0][0];

  var uponResponse = requestJson(topicName);

  return uponResponse.then((paragraphsBySubtopic) => {
    const promisedDomTree = renderDomTree(
      pathArray[0][0],
      pathArray,
      paragraphsBySubtopic,
      [],
      {},
      pathDepth
    );

    const promisedDomTreeWithRule = promisedDomTree.then((domTree) => {
      if (pathDepth > 0) {
        var hr = document.createElement('HR');
        domTree.prepend(hr);
      }

      return domTree;
    });

    return promisedDomTreeWithRule;
  });
}

export default fetchAndRenderPath;
