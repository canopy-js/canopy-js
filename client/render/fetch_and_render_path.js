import renderDomTree from 'render/render_dom_tree';
import { requestJson } from 'requests/request_json';
import Path from 'models/path';
import Paragraph from 'models/paragraph';
import { canopyContainer } from 'helpers/getters';
import { generateHeader } from 'render/helpers';
import Topic from '../../cli/shared/topic';
let promiseCache = {};
let headerCache = {};

function invalidateFetchAndRenderCache() {
  promiseCache = {};
  headerCache = {};
}

const fetchAndRenderPath = (fullPath, remainingPath, parentElementPromise, options = {}) => {
  if (remainingPath.length === 0) return Promise.resolve();

  let pathToParagraph = fullPath.slice(0, fullPath.length - remainingPath.length + 1);
  let pathToParagraphTopic = pathToParagraph.removeTerminalSubtopic;

  let renderedTopicSectionElement = pathToParagraphTopic.renderedParagraph?.sectionElement;
  let preexistingSectionElementPromise = renderedTopicSectionElement ? Promise.resolve(renderedTopicSectionElement) : null;
  let cachedSectionElementPromise = promiseCache[pathToParagraphTopic.string];
  let renderContext = { childRegistrations: [] };

  let sectionElementPromise = preexistingSectionElementPromise || cachedSectionElementPromise || requestJson(remainingPath.firstTopic)
    .then(json => {
      if (!json) return null;
      let { paragraphsBySubtopic, displayTopicName, topicTokens } = json;
      let sectionElementToDecorate = Path.placeholderAt(pathToParagraphTopic)?.sectionElement;
      if (displayTopicName) headerCache[Topic.for(displayTopicName).mixedCase] = [topicTokens, displayTopicName]; // only cache on original request

      Object.assign(renderContext, {
        remainingPath,
        displayTopicName,
        paragraphsBySubtopic,
        fullPath,
        pathToParagraph,
        pathDepth: fullPath.length - remainingPath.length,
        preDisplayCallbacks: []
      });

      return renderDomTree(
        remainingPath.firstTopic,
        remainingPath.firstTopic,
        renderContext,
        sectionElementToDecorate
      );
    }).catch(e => { console.error(e); return null; }); // 404

  let appendingPromise = Promise.all([parentElementPromise, sectionElementPromise]).then(([parentElement, sectionElement]) => {
    if (!parentElement || !sectionElement) return Promise.resolve(); // null parent eg if appending failed
    if (fullPath.equals(remainingPath)) canopyContainer.prepend(generateHeader(...headerCache[sectionElement.dataset.topicName])); // regen if necessary
    if (parentElement !== canopyContainer && !Path.connectingLinkValid(parentElement, remainingPath)) {
      Paragraph.unregisterTree(sectionElement);
      delete promiseCache[pathToParagraphTopic.string];
      return Promise.resolve(false);
    } // fail silently, error on tryPrefix

    if (renderedTopicSectionElement) return Promise.resolve(true);

    renderContext.childRegistrations.forEach(([childElement, childParentElement]) => {
      Paragraph.registerChild(childElement, childParentElement);
    });
    Paragraph.registerChild(sectionElement, parentElement);
    const preDisplayPromise = options.renderOnly ? Promise.resolve() : Paragraph.executePreDisplayCallbacksTree(sectionElement);
    return preDisplayPromise.then(() => true);
  });

  if (!preexistingSectionElementPromise && !cachedSectionElementPromise) {
    // Render and attachment complete.
    promiseCache[pathToParagraphTopic.string] = Promise.all([sectionElementPromise, appendingPromise])
      .then(([sectionElement]) => sectionElement);
  }

  let subtopicAfterSubsumptionPromise = Promise.all([appendingPromise, sectionElementPromise])
    .then(([appendingSuccess, sectionElement]) => { // the subtopic of current topic that is parent of next path segment
      if (!appendingSuccess || !sectionElement) return null;
      return remainingPath.firstSubtopic.mixedCase === sectionElement.dataset.topicName ?
        sectionElement : Paragraph.byPath(pathToParagraph)?.sectionElement;
    });

  let childSectionElementPromise = fetchAndRenderPath(fullPath, remainingPath.withoutFirstSegment, subtopicAfterSubsumptionPromise, options);

  return Promise.all([sectionElementPromise, childSectionElementPromise, appendingPromise]) // work for this stackframe is finished
    .then(([sectionElement]) => sectionElement);
}

export { fetchAndRenderPath, invalidateFetchAndRenderCache };
