import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';
import Path from 'models/path';
import { canopyContainer } from 'helpers/getters';
import ScrollableContainer from 'helpers/scrollable_container';
import { generateHeader } from 'render/helpers';
let promiseCache = {};

const fetchAndRenderPath = (fullPath, remainingPath, parentElementPromise) => {
  if (remainingPath.length === 0) return Promise.resolve(parentElementPromise);
  let pathToParagraph = fullPath.slice(0, fullPath.length - remainingPath.length + 1);
  let pathToParagraphTopic = pathToParagraph.removeTerminalSubtopic;
  let preexistingSectionElement = Path.elementAtRelativePath(pathToParagraphTopic, canopyContainer);
  let preexistingSectionElementPromise = preexistingSectionElement ? Promise.resolve(preexistingSectionElement) : null;

  let sectionElementPromise = preexistingSectionElementPromise || promiseCache[pathToParagraphTopic.string] || requestJson(remainingPath.firstTopic)
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
          pathToParagraph,
          pathDepth: fullPath.length - remainingPath.length
        },
      );
    }).catch(e => { return null }); // 404

  promiseCache[pathToParagraphTopic.string] = sectionElementPromise;

  let appendingPromise = Promise.all([parentElementPromise, sectionElementPromise]).then(([parentSectionElement, sectionElement]) => {
    if (!parentSectionElement || !sectionElement) return Promise.resolve();
    if (!Path.connectingLinkValid(parentSectionElement, remainingPath)) return Promise.resolve(); // fail silently, error on tryPrefix
    parentSectionElement.appendChild(sectionElement);
  });

  let subtopicElementPromise = sectionElementPromise.then(sectionElement => {
    if (!sectionElement) return null;
    return sectionElement.querySelector(`section[data-subtopic-name="${remainingPath.firstSubtopic.cssMixedCase}"]`) || sectionElement; // querySelector can't target self
  });

  let childSectionElementPromise = fetchAndRenderPath(fullPath, remainingPath.withoutFirstSegment, subtopicElementPromise);

  return Promise.all([sectionElementPromise, parentElementPromise, childSectionElementPromise, appendingPromise])
    .then(([sectionElement]) => sectionElement);
}

export default fetchAndRenderPath;
