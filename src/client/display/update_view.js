import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import {
  defaultTopic,
  canopyContainer,
  childSectionElementOfParentLink
} from 'helpers/getters';

const updateView = (pathToDisplay, linkToSelect, displayOptions) => {
  let newTreeAppended = fetchAndRenderPath(pathToDisplay, canopyContainer, true);

  newTreeAppended.then(() => {
    displayPath(
      pathToDisplay,
      linkToSelect,
      displayOptions
    );
  });
}

export default updateView;
