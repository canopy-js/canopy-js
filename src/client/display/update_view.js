import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import {
  defaultTopic,
  canopyContainer,
  childSectionElementOfParentLink
} from 'helpers/getters';

const updateView = (pathToDisplay, linkToSelect, displayOptions) => {
  if (!pathToDisplay) throw "updateView requires a path argument";

  let newTreeAppended = fetchAndRenderPath(pathToDisplay, canopyContainer);

  newTreeAppended.then(() => {
    displayPath(
      pathToDisplay,
      linkToSelect,
      displayOptions
    );
  });
}

export default updateView;
