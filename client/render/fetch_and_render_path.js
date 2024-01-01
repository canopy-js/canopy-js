import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';
import Path from 'models/path';
import { canopyContainer } from 'helpers/getters';
import { generateHeader } from 'render/helpers';
import BackButton from 'render/back_button';

const fetchAndRenderPath = (fullPath, remainingPath, parentElementOrPromise) => {
  if (remainingPath.length === 0) {
    return Promise.resolve();
  }

  if (parentElementOrPromise instanceof HTMLElement) {
    let preexistingElement = Path.elementAtRelativePath(remainingPath.firstSegment, parentElementOrPromise);
    if (preexistingElement) return fetchAndRenderPath(fullPath, remainingPath.withoutFirstSegment, preexistingElement);
    parentElementOrPromise = Promise.resolve(parentElementOrPromise);
  }

  let sectionElementPromise = requestJson(remainingPath.firstTopic)
    .then(({ paragraphsBySubtopic, displayTopicName, topicTokens }) => {
      if (fullPath.equals(remainingPath)) canopyContainer.prepend(generateHeader(topicTokens, displayTopicName));

      return renderDomTree(
        remainingPath.firstTopic,
        remainingPath.firstTopic,
        {
          remainingPath,
          displayTopicName,
          paragraphsBySubtopic,
          fullPath,
          pathDepth: fullPath.length - remainingPath.length
        },
      );
    });

  let appendingPromise = Promise.all([parentElementOrPromise, sectionElementPromise]).then(([parentSectionElement, sectionElement]) => {
    if (!Path.connectingLinkValid(parentSectionElement, remainingPath)) return Promise.resolve(); // fail silently, error on tryPrefix
    parentSectionElement.appendChild(sectionElement);
    canopyContainer.appendChild(BackButton.container); // move to last
  });

  let subtopicElementPromise = sectionElementPromise.then(sectionElement => {
    return sectionElement.querySelector(`section[data-subtopic-name="${remainingPath.firstSubtopic.escapedMixedCase}"]`) || sectionElement;
  });

  let childSectionElementPromise = fetchAndRenderPath(fullPath, remainingPath.withoutFirstSegment, subtopicElementPromise);

  return Promise.all([sectionElementPromise, parentElementOrPromise, childSectionElementPromise, appendingPromise])
    .then(([sectionElement]) => sectionElement);
}

export default fetchAndRenderPath;
