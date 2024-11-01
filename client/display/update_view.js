import { fetchAndRenderPath } from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import Paragraph from 'models/paragraph';
import { canopyContainer } from 'helpers/getters';
let lastPath = null; // ensure only the last call gets displayed

const updateView = (pathToDisplay, linkToSelect, options = {}) => {
  if (pathToDisplay?.empty) pathToDisplay = Path.default;

  let renderComplete = (lastPath = (!options?.renderOnly && pathToDisplay) || lastPath) &&
    fetchAndRenderPath(pathToDisplay, pathToDisplay, Promise.resolve(canopyContainer)).catch(e => console.error(e));

  Promise.race([
    renderComplete,
    (new Promise(resolve => setTimeout(resolve, 400)))
  ]).then((success) => {
    if (!success && linkToSelect && Paragraph.contentLoaded && !options.renderOnly) {
      linkToSelect?.tryElement && linkToSelect.addSelectionClass() || updateView(linkToSelect.enclosingPath, linkToSelect, { pending: true });
    }
  });

  return renderComplete.then(() => {
    if (!options?.renderOnly && pathToDisplay.equals(lastPath)) displayPath(
      pathToDisplay,
      linkToSelect,
      options
    );
  }).catch(e => console.error(e));
}

export default updateView;
