import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import {
  defaultTopic,
  canopyContainer,
  findLowestExtantSectionElementOfPath,
  findLinkFromMetadata
} from 'helpers/getters';

const updateView = (pathArray, selectedLinkData, selectALink, popState) => {
  var topicName = pathArray[0][0];
  var subtopicName = pathArray[0][1];

  var {
    lowestExtantSectionElementOfPath,
    pathSuffixToRender
  } = findLowestExtantSectionElementOfPath(pathArray);

  var promisedDomTree = fetchAndRenderPath(
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
      var anchorElement = lowestExtantSectionElementOfPath || canopyContainer;

      var newNodeAlreadyPresent = Array.from(anchorElement.childNodes)
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
      popState
    );
  });
}

export default updateView;
