import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import { canopyContainer } from 'helpers/getters';

const updateView = (pathToDisplay, linkToSelect, displayOptions) => {
  validatePathAndLink(pathToDisplay, linkToSelect);
  if (pathToDisplay.empty) pathToDisplay = Path.default;

  let newTreeAppended = fetchAndRenderPath(pathToDisplay, canopyContainer).catch(e => console.error(e));

  return newTreeAppended.then(() => {
    displayPath(
      pathToDisplay,
      linkToSelect,
      displayOptions
    );
  }).catch(handleDisplayError(pathToDisplay, displayOptions));
}

function validatePathAndLink(pathToDisplay, linkToSelect) {
  if (!(pathToDisplay instanceof Path)) throw new Error('Invalid path argument');
  if (linkToSelect && !(linkToSelect instanceof Link)) throw new Error('Invalid link selection argument');
}

function handleDisplayError(pathToDisplay, displayOptions) {
  return (e) => {
    if (e.message === 'Link selector callback provided no link') {
      displayPath(pathToDisplay, null, displayOptions);
    } else {
      console.error(e);
    }
  }
}

export default updateView;
