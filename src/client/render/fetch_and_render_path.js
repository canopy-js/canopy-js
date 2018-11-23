import renderTopicDomTree from 'render/render_topic_dom_tree';
import requestJson from 'requests/request_json';

const fetchAndRenderPath = (pathArray, pathDepth) => {
  var topicName = pathArray[0][0];

  var uponResponse = requestJson(topicName);

  return uponResponse.then((paragraphsBySubtopic) => {
    const domTree = renderTopicDomTree(
      pathArray[0][0],
      pathArray,
      paragraphsBySubtopic,
      [],
      {},
      pathDepth
    );

    return domTree;
  });
}

export default fetchAndRenderPath;
