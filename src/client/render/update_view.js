import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import {
  defaultTopic,
  canopyContainer,
  findLowestExtantSectionElementOfPath,
  findLinkFromMetadata
} from 'helpers/getters';

const updateView = (pathArray, selectedLinkData, selectALink, popState, clearDfsClasses) => {
  let topicName = pathArray[0][0];
  let subtopicName = pathArray[0][1];

  let {
    lowestExtantSectionElementOfPath,
    pathSuffixToRender
  } = findLowestExtantSectionElementOfPath(pathArray);

  let promisedDomTree = fetchAndRenderPath(
    pathSuffixToRender,
    pathArray.length - pathSuffixToRender.length
  )

  promisedDomTree.catch((e) => {
    if (canopyContainer.childNodes.length === 0) {
      return updateView([[defaultTopic, defaultTopic]]);
    }
  })

  promisedDomTree.then((domTree) => {
    if (domTree) {
      let anchorElement = lowestExtantSectionElementOfPath || canopyContainer;

      let newNodeAlreadyPresent = Array.from(anchorElement.childNodes)
        .filter((childNode) => {
          return childNode.dataset &&
            childNode.dataset.topicName === domTree.dataset.topicName &&
            childNode.dataset.subtopicName === domTree.dataset.subtopicName;
        }).length > 0;

      if (!newNodeAlreadyPresent) {
        anchorElement.appendChild(domTree);
      }
    }

    displayPath(
      pathArray,
      selectedLinkData && findLinkFromMetadata(selectedLinkData),
      selectALink,
      popState,
      clearDfsClasses
    );
  });
}

export default updateView;
