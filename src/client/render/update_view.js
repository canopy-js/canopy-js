import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import {
  defaultTopic,
  canopyContainer,
  findLowestExtantSectionElementOfPath,
  findLinkFromMetadata
} from 'helpers/getters';

const updateView = (pathArray, selectedLinkData, selectALink) => {
  var topicName = pathArray[0][0];
  var subtopicName = pathArray[0][1];

  var {
    lowestExtantSectionElementOfPath,
    pathSuffixToRender
  } = findLowestExtantSectionElementOfPath(pathArray);

  if (pathSuffixToRender.length === 0) {
    return displayPath(
      pathArray,
      selectedLinkData && findLinkFromMetadata(selectedLinkData),
      selectALink
    );
  }

  var whenDomRendered = fetchAndRenderPath(
      pathSuffixToRender,
      0
    );

  // We don't want to give up anymore just because we had one failure, salvage the rest of the path
  // whenDomRendered.catch((e) => {
  //   updateView([[defaultTopic, defaultTopic]], null);
  // });

  whenDomRendered.then((domTree) => {
    (lowestExtantSectionElementOfPath || canopyContainer).appendChild(domTree);

    displayPath(
      pathArray,
      selectedLinkData && findLinkFromMetadata(selectedLinkData),
      selectALink
    );
  });
}

export default updateView;
