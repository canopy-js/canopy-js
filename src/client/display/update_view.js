import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import {
  defaultTopic,
  canopyContainer,
  findLowestExtantSectionElementOfPath,
  childSectionElementOfParentLink
} from 'helpers/getters';

import { newNodeAlreadyPresent } from 'display/helpers';

const updateView = (pathArray, updateOptions) => {
  let {
    lowestExtantSectionElementOfPath,
    pathSuffixToRender
  } = findLowestExtantSectionElementOfPath(pathArray);

  let promisedDomTree = fetchAndRenderPath(
    pathSuffixToRender,
    pathArray.length - pathSuffixToRender.length
  )

  promisedDomTree.then((domTree) => {
    if (domTree) {
      let anchorElement = lowestExtantSectionElementOfPath || canopyContainer;
      if (!newNodeAlreadyPresent(anchorElement, domTree)) {
        anchorElement.appendChild(domTree);
      }
    }

    displayPath(
      pathArray,
      updateOptions
    );
  });
}

export default updateView;
