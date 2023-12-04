import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import { canopyContainer, backButton } from 'helpers/getters';
import { validatePathAndLink } from 'display/helpers';

const updateView = (pathToDisplay, linkToSelect, displayOptions) => {
  validatePathAndLink(pathToDisplay, linkToSelect);
  if (pathToDisplay.empty) pathToDisplay = Path.default;
  document.title = pathToDisplay.firstTopic.mixedCase;

  let newTreeAppended = fetchAndRenderPath(pathToDisplay, canopyContainer).catch(e => console.error(e));

  return newTreeAppended.then(() => {
    displayPath(
      pathToDisplay,
      linkToSelect,
      displayOptions
    );
  }).catch(e => console.error(e));
}

export default updateView;
