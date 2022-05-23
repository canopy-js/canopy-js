import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';

const fetchAndRenderPath = (path, parentElement, eagerRenderGlobalChildren) => {
  if (path.length === 0) {
    return Promise.resolve(null);
  }

  let preexistingNode = path.firstSegment.relativeSectionElement(parentElement);
  if (preexistingNode) {
    return fetchAndRenderPath(path.withoutFirstSegment, preexistingNode);
  }

  let pathDepth = Number(parentElement.dataset.pathDepth) + 1 || 0;
  let placeHolderElement = createPlaceholderElement(path.firstTopic, path.firstSubtopic, pathDepth);
  parentElement.appendChild(placeHolderElement); // this prevents duplicates

  let uponResponsePromise = requestJson(path.firstTopic);

  return uponResponsePromise.then(({ paragraphsBySubtopic, displayTopicName }) => {
    return renderDomTree(
      {
        topicName: path.firstTopic,
        subtopicName: path.firstTopic,
        path,
        displayTopicName,
        paragraphsBySubtopic,
        subtopicsAlreadyRendered: {},
        pathDepth,
        placeHolderElement,
        eagerRenderGlobalChildren
      },
    );
  });
}

function createPlaceholderElement(topicName, subtopicName, pathDepth) {
  let sectionElement = document.createElement('section');
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.subtopicName = subtopicName;
  sectionElement.dataset.pathDepth = pathDepth;
  return sectionElement;
}

export default fetchAndRenderPath;
