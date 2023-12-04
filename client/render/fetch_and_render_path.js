import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';
import Path from 'models/path';
import { canopyContainer } from 'helpers/getters';
import { generateHeader } from 'render/helpers';

const fetchAndRenderPath = (pathToDisplay, parentElement) => {
  if (pathToDisplay.length === 0) {
    return Promise.resolve(null);
  }

  pathToDisplay.slice(1).forEach(([topic]) => { requestJson(topic) }); // preload later path segments

  let preexistingElement = Path.elementAtRelativePath(pathToDisplay.firstSegment, parentElement);
  if (preexistingElement) {
    if (!Path.connectingLinkValid(parentElement, pathToDisplay)) return Promise.resolve();
    return fetchAndRenderPath(pathToDisplay.withoutFirstSegment, preexistingElement);
  }

  let uponResponsePromise = requestJson(pathToDisplay.firstTopic);

  let uponRender = uponResponsePromise.then(({ paragraphsBySubtopic, displayTopicName, topicTokens }) => {
    let headerElement = parentElement === canopyContainer ? // generate header if paragraph is root
      Promise.resolve(generateHeader(topicTokens, displayTopicName)) : null;

    let sectionElement = renderDomTree(
      {
        topic: pathToDisplay.firstTopic,
        subtopic: pathToDisplay.firstTopic,
        pathToDisplay,
        displayTopicName,
        paragraphsBySubtopic,
        pathDepth: Number(parentElement.dataset.pathDepth) + 1 || 0
      },
    );

    return Promise.all([sectionElement, headerElement]);
  });

  return uponRender.then(([ sectionElement, headerElement ]) => {
    headerElement && canopyContainer.prepend(headerElement);
    if (parentElement !== canopyContainer) {
      parentElement.appendChild(sectionElement);
    } else {
      parentElement.insertBefore(sectionElement, null); // make sure section is before back button container
    }
  });
}

export default fetchAndRenderPath;
