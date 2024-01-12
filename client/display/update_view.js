import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import { canopyContainer, backButton } from 'helpers/getters';

const updateView = (pathToDisplay, linkToSelect, options = {}) => {
  if (pathToDisplay.empty) pathToDisplay = Path.default;
  if (!options.renderOnly && !options.noDisplay) document.title = pathToDisplay.lastTopic.mixedCase;

  let newTreeAppended = fetchAndRenderPath(pathToDisplay, pathToDisplay, canopyContainer).catch(e => console.error(e));

  return newTreeAppended.then(() => {
    if (!options?.renderOnly) displayPath(
      pathToDisplay,
      linkToSelect,
      options
    );
  }).catch(e => console.error(e));
}

export default updateView;
