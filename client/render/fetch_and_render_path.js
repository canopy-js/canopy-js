import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';
import Paragraph from 'models/paragraph';
import Path from 'models/path';
import Link from 'models/link';
import { canopyContainer } from 'helpers/getters';

const fetchAndRenderPath = (pathToDisplay, parentElement) => {
  if (pathToDisplay.length === 0) {
    return Promise.resolve(null);
  }

  let preexistingElement = Path.elementAtRelativePath(pathToDisplay.firstSegment, parentElement);
  if (preexistingElement) {
    Path.validateConnectingLink(parentElement, pathToDisplay);
    return fetchAndRenderPath(pathToDisplay.withoutFirstSegment, preexistingElement);
  }

  let uponResponsePromise = requestJson(pathToDisplay.firstTopic);

  let uponRender = uponResponsePromise.then(({ paragraphsBySubtopic, displayTopicName }) => {
    return renderDomTree(
      {
        topicName: pathToDisplay.firstTopic,
        subtopicName: pathToDisplay.firstTopic,
        pathToDisplay,
        displayTopicName,
        paragraphsBySubtopic,
        pathDepth: Number(parentElement.dataset.pathDepth) + 1 || 0
      },
    );
  });

  return uponRender.then((domTree) => parentElement.appendChild(domTree));
}

export default fetchAndRenderPath;
