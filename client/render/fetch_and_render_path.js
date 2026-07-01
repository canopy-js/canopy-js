import renderDomTree from 'render/render_dom_tree';
import { requestJson } from 'requests/request_json';
import Path from 'models/path';
import Paragraph from 'models/paragraph';
import { canopyContainer } from 'helpers/getters';
import { generateHeader } from 'render/helpers';
import Topic from '../../cli/shared/topic';
let promiseCache = {};
let headerCache = {};
let fetchAndRenderFrameId = 0;

function debugFetchAndRender(_frameId, _message, _details = {}) {
  return;
}

function invalidateFetchAndRenderCache() {
  promiseCache = {};
  headerCache = {};
}

const fetchAndRenderPath = (fullPath, remainingPath, parentElementPromise, options = {}) => {
  if (remainingPath.length === 0) return Promise.resolve();
  const frameId = ++fetchAndRenderFrameId;
  debugFetchAndRender(frameId, 'start', {
    fullPath: fullPath.string,
    remainingPath: remainingPath.string,
    renderOnly: options.renderOnly,
    initialLoad: options.initialLoad
  });

  let pathToParagraph = fullPath.slice(0, fullPath.length - remainingPath.length + 1);
  let pathToParagraphTopic = pathToParagraph.removeTerminalSubtopic;

  let paragraphAlreadyRendered = pathToParagraph.renderedParagraph;
  let renderedTopicSectionElement = paragraphAlreadyRendered && pathToParagraphTopic.renderedParagraph?.sectionElement;
  let preexistingSectionElementPromise = renderedTopicSectionElement ? Promise.resolve(renderedTopicSectionElement) : null;
  let cachedSectionElementPromise = promiseCache[pathToParagraphTopic.string];
  debugFetchAndRender(frameId, 'resolved inputs', {
    pathToParagraph: pathToParagraph.string,
    pathToParagraphTopic: pathToParagraphTopic.string,
    paragraphAlreadyRendered: !!paragraphAlreadyRendered,
    renderedTopicSectionElement: !!renderedTopicSectionElement,
    cachedSectionElementPromise: !!cachedSectionElementPromise,
    placeholderPath: Path.placeholderAt(pathToParagraphTopic)?.path?.string
  });

  let sectionElementPromise = preexistingSectionElementPromise || cachedSectionElementPromise || requestJson(remainingPath.firstTopic)
    .then(json => {
      debugFetchAndRender(frameId, 'request complete', {
        topic: remainingPath.firstTopic.mixedCase,
        pathToParagraphTopic: pathToParagraphTopic.string
      });
      return json;
    })
    .then(json => {
      let { paragraphsBySubtopic, displayTopicName, topicTokens } = json;
      let sectionElementToDecorate = Path.placeholderAt(pathToParagraphTopic)?.sectionElement;
      if (displayTopicName) headerCache[Topic.for(displayTopicName).mixedCase] = [topicTokens, displayTopicName]; // only cache on original request

      const sectionElement = renderDomTree(
        remainingPath.firstTopic,
        remainingPath.firstTopic,
        {
          remainingPath,
          displayTopicName,
          paragraphsBySubtopic,
          fullPath,
          pathToParagraph,
          pathDepth: fullPath.length - remainingPath.length,
          preDisplayCallbacks: []
        },
        sectionElementToDecorate
      );
      debugFetchAndRender(frameId, 'renderDomTree complete', {
        pathToParagraphTopic: pathToParagraphTopic.string,
        sectionPath: sectionElement?.dataset?.pathString,
        decoratedPlaceholder: !!sectionElementToDecorate,
        paragraphByPathToParagraph: !!Paragraph.byPath(pathToParagraph)
      });
      return sectionElement;
    }).catch(e => { console.error(e); return null; }); // 404

  let appendingPromise = Promise.all([parentElementPromise, sectionElementPromise]).then(([parentElement, sectionElement]) => {
    debugFetchAndRender(frameId, 'append start', {
      pathToParagraph: pathToParagraph.string,
      pathToParagraphTopic: pathToParagraphTopic.string,
      parentPath: parentElement?.dataset?.pathString || 'canopyContainer',
      sectionPath: sectionElement?.dataset?.pathString,
      paragraphAlreadyRendered: !!paragraphAlreadyRendered
    });
    if (!parentElement || !sectionElement) return Promise.resolve(); // null parent eg if appending failed
    if (fullPath.equals(remainingPath)) canopyContainer.prepend(generateHeader(...headerCache[sectionElement.dataset.topicName])); // regen if necessary
    if (parentElement !== canopyContainer && !Path.connectingLinkValid(parentElement, remainingPath)) {
      debugFetchAndRender(frameId, 'append invalid connecting link', {
        parentPath: parentElement?.dataset?.pathString,
        remainingPath: remainingPath.string
      });
      return Promise.resolve(false);
    } // fail silently, error on tryPrefix

    if (paragraphAlreadyRendered) {
      debugFetchAndRender(frameId, 'append skipped already rendered', {
        pathToParagraph: pathToParagraph.string
      });
      return Promise.resolve(true);
    }

    Paragraph.registerChild(sectionElement, parentElement);
    const preDisplayPromise = options.renderOnly ? Promise.resolve() : Paragraph.executePreDisplayCallbacksTree(sectionElement);
    return preDisplayPromise.then(() => {
      debugFetchAndRender(frameId, 'append complete', {
        pathToParagraph: pathToParagraph.string,
        pathToParagraphTopic: pathToParagraphTopic.string
      });
      return true;
    });
  });

  if (!preexistingSectionElementPromise && !cachedSectionElementPromise) {
    // Render and attachment complete.
    promiseCache[pathToParagraphTopic.string] = Promise.all([sectionElementPromise, appendingPromise])
      .then(([sectionElement]) => sectionElement);
  }

  let subtopicElementPromise = sectionElementPromise.then(sectionElement => { // the subtopic of current topic that is parent of next path segment
    if (!sectionElement) return null;
    let subtopicElement;
    if (remainingPath.firstSubtopic.mixedCase === sectionElement.dataset.topicName) {
      subtopicElement = sectionElement;
    } else {
      subtopicElement = sectionElement.querySelector(`section[data-subtopic-name="${remainingPath.firstSubtopic.cssMixedCase}"]`) || // on first render still attached
        Paragraph.byPath(pathToParagraph)?.sectionElement; // subsequent renders detached and cached
    }
    debugFetchAndRender(frameId, 'subtopic resolved', {
      remainingPath: remainingPath.string,
      firstSubtopic: remainingPath.firstSubtopic.mixedCase,
      pathToParagraph: pathToParagraph.string,
      subtopicPath: subtopicElement?.dataset?.pathString,
      subtopicConnected: !!subtopicElement?.isConnected,
      paragraphByPathToParagraph: !!Paragraph.byPath(pathToParagraph)
    });
    return subtopicElement;
  });

  let subtopicAfterSubsumptionPromise = Promise.all([appendingPromise, subtopicElementPromise, parentElementPromise]) // n+1's parent waits for path from root
    .then(([appendingSuccess, subtopicElement]) => {
      debugFetchAndRender(frameId, 'subtopic after append', {
        appendingSuccess,
        subtopicPath: subtopicElement?.dataset?.pathString
      });
      return appendingSuccess && subtopicElement;
    }); //

  let childSectionElementPromise = fetchAndRenderPath(fullPath, remainingPath.withoutFirstSegment, subtopicAfterSubsumptionPromise, options);

  return Promise.all([sectionElementPromise, childSectionElementPromise, appendingPromise]) // work for this stackframe is finished
    .then(([sectionElement]) => {
      debugFetchAndRender(frameId, 'complete', {
        pathToParagraph: pathToParagraph.string,
        sectionPath: sectionElement?.dataset?.pathString
      });
      return sectionElement;
    });
}

export { fetchAndRenderPath, invalidateFetchAndRenderCache };
