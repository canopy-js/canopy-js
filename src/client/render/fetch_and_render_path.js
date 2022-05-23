import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';
import Paragraph from 'models/paragraph';
import Path from 'models/path';

const fetchAndRenderPath = (path, parentElement, eagerRenderGlobalChildren) => {
  if (path.length === 0) {
    if (eagerRenderGlobalChildren) eagerRenderGlobalChildrenOf(parentElement);
    return Promise.resolve(null);
  }

  let preexistingNode = path.firstSegment.relativeSectionElement(parentElement);
  if (preexistingNode) {
    return fetchAndRenderPath(path.withoutFirstSegment, preexistingNode, eagerRenderGlobalChildren);
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

function eagerRenderGlobalChildrenOf(parentElement) {
  let paragraph = new Paragraph(parentElement);
  let links = paragraph.linksBySelector((link) => link.isGlobal);
  links.forEach(
    (link) => fetchAndRenderPath(Path.forTopic(link.targetTopic), parentElement, false)
  );
}

export default fetchAndRenderPath;
