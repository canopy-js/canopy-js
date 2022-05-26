import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';
import Paragraph from 'models/paragraph';
import Path from 'models/path';
import Link from 'models/link';
import { canopyContainer } from 'helpers/getters';

const fetchAndRenderPath = (pathToDisplay, parentElement, eagerRenderGlobalChildren) => {
  if (pathToDisplay.length === 0) {
    if (eagerRenderGlobalChildren) eagerRenderGlobalChildrenOf(parentElement);
    return Promise.resolve(null);
  }

  let preexistingElement = pathToDisplay.firstSegment.relativeSectionElement(parentElement);
  if (preexistingElement) {
    if (!Path.parentHasConnectingLink(parentElement, pathToDisplay)) throw "No link for path adjacency";
    return fetchAndRenderPath(pathToDisplay.withoutFirstSegment, preexistingElement, eagerRenderGlobalChildren);
  }

  let pathDepth = Number(parentElement.dataset.pathDepth) + 1 || 0;
  let placeHolderElement = createPlaceholderElement(pathToDisplay.firstTopic, pathToDisplay.firstSubtopic, pathDepth);
  parentElement.appendChild(placeHolderElement); // this prevents duplicates

  let uponResponsePromise = requestJson(pathToDisplay.firstTopic);

  return uponResponsePromise.then(({ paragraphsBySubtopic, displayTopicName }) => {
    return renderDomTree(
      {
        topicName: pathToDisplay.firstTopic,
        subtopicName: pathToDisplay.firstTopic,
        pathToDisplay,
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
