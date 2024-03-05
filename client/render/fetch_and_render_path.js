import renderDomTree from 'render/render_dom_tree';
import requestJson from 'requests/request_json';
import Path from 'models/path';
import Paragraph from 'models/paragraph';
import { canopyContainer } from 'helpers/getters';
import ScrollableContainer from 'helpers/scrollable_container';
import { generateHeader } from 'render/helpers';
let promiseCache = {};
let headerCache = {};

const fetchAndRenderPath = (fullPath, remainingPath, parentElementPromise) => {
  if (remainingPath.length === 0) return Promise.resolve();

  let pathToParagraph = fullPath.slice(0, fullPath.length - remainingPath.length + 1);
  let pathToParagraphTopic = pathToParagraph.removeTerminalSubtopic;
  let preexistingSectionElement = Path.elementAtRelativePath(pathToParagraphTopic, canopyContainer);
  let preexistingSectionElementPromise = preexistingSectionElement ? Promise.resolve(preexistingSectionElement) : null;

  let sectionElementPromise = preexistingSectionElementPromise || promiseCache[pathToParagraphTopic.string] || requestJson(remainingPath.firstTopic)
    .then(({ paragraphsBySubtopic, displayTopicName, topicTokens }) => {
      headerCache[remainingPath.firstTopic.mixedCase] = [topicTokens, displayTopicName];

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
    }).catch(e => { console.error(e); return null; }); // 404

  promiseCache[pathToParagraphTopic.string] = sectionElementPromise;

  let appendingPromise = Promise.all([parentElementPromise, sectionElementPromise]).then(([parentElement, sectionElement]) => {
    if (!parentElement || !sectionElement) return Promise.resolve(); // null parent eg if appending failed
    if (fullPath.equals(remainingPath)) canopyContainer.prepend(generateHeader.apply(this, headerCache[sectionElement.dataset.topicName])); // regen if necessary
    if (!Path.connectingLinkValid(parentElement, remainingPath)) return Promise.resolve(false); // fail silently, error on tryPrefix
    if (!Paragraph.byPath(pathToParagraphTopic)) {
      Paragraph.registerChild(sectionElement, parentElement);
      Paragraph.registerSubtopics(sectionElement); // only once we know the topic itself is connected, requires subtopics still be connected from render
      Paragraph.detachSubtopics(sectionElement); // has to be done after registerSubtopics
    }
    return Promise.resolve(true);
  });

  let subtopicElementPromise = sectionElementPromise.then(sectionElement => { // the subtopic of current topic that is parent of next path segment
    if (!sectionElement) return null;
    if (remainingPath.firstSubtopic.mixedCase === sectionElement.dataset.topicName) {
      return sectionElement;
    } else {
      return sectionElement.querySelector(`section[data-subtopic-name="${remainingPath.firstSubtopic.cssMixedCase}"]`);
    }
  });

  let subtopicAfterSubsumptionPromise = Promise.all([appendingPromise, subtopicElementPromise, parentElementPromise]) // n+1's parent waits for path from root
    .then(([appendingSuccess, subtopicElement]) => appendingSuccess && subtopicElement); //

  let childSectionElementPromise = fetchAndRenderPath(fullPath, remainingPath.withoutFirstSegment, subtopicAfterSubsumptionPromise);

  return Promise.all([sectionElementPromise, childSectionElementPromise, appendingPromise]) // work for this stackframe is finished
    .then(([sectionElement]) => sectionElement);
}

export default fetchAndRenderPath;
