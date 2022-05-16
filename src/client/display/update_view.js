import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import {
  defaultTopic,
  canopyContainer,
  findLowestExtantSectionElementOfPath,
  childSectionElementOfParentLink
} from 'helpers/getters';

import { newNodeAlreadyPresent } from 'display/helpers';

const updateView = (pathArray, displayOptions) => {
  let newTreeAppended = fetchAndRenderPath(pathArray, canopyContainer, true);

  newTreeAppended.then(() => {
    displayPath(
      pathArray,
      displayOptions
    );
  });
}

export default updateView;
