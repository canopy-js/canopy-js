import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';
import Path from 'models/path';
import Topic from '../../bin/commands/shared/topic';

const fetchAndRenderPath = (pathToDisplay, parentElement) => {
  if (pathToDisplay.length === 0) {
    return Promise.resolve(null);
  }

  let preexistingElement = Path.elementAtRelativePath(pathToDisplay.firstSegment, parentElement);
  if (preexistingElement) {
    if (!Path.connectingLinkValid(parentElement, pathToDisplay)) return Promise.resolve();
    return fetchAndRenderPath(pathToDisplay.withoutFirstSegment, preexistingElement);
  }

  let uponResponsePromise = requestJson(pathToDisplay.firstTopic);

  let uponRender = uponResponsePromise.then(({ paragraphsBySubtopic, displayTopicName }) => {
    return renderDomTree(
      {
        topic: new Topic(displayTopicName),
        subtopic: new Topic(displayTopicName),
        pathToDisplay,
        paragraphsBySubtopic,
        pathDepth: Number(parentElement.dataset.pathDepth) + 1 || 0
      },
    );
  });

  return uponRender.then((domTree) => parentElement.appendChild(domTree));
}

export default fetchAndRenderPath;
