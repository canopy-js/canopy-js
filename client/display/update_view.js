import { fetchAndRenderPath } from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import { displayPlaceholderSection } from 'display/helpers';
import Path from 'models/path';
import { canopyContainer } from 'helpers/getters';
let lastPath = null; // ensure only the last call gets displayed

const updateView = (pathToDisplay, linkToSelect, options = {}) => {
  if (pathToDisplay?.empty) pathToDisplay = Path.default;
  if (!options?.renderOnly && pathToDisplay) {
    lastPath = pathToDisplay;
  }

  displayPlaceholderSection(pathToDisplay, linkToSelect, options)
    .catch(e => console.error(e));

  let renderComplete = pathToDisplay && Promise.resolve()
    .then(() => new Promise(resolve => setTimeout(resolve))) // make gap for placeholder paint
    .then(() => fetchAndRenderPath(pathToDisplay, pathToDisplay, Promise.resolve(canopyContainer), options))
    .catch(e => console.error(e));

  return Promise.resolve(renderComplete).then(renderedSectionElement => {
    if (!renderedSectionElement) Path.placeholderOnPath(pathToDisplay)?.unregister();

    let displayOptions = Path.url.equals(pathToDisplay) && Path.lastRenderedPath?.paragraph?.loadingElementVisible ?
      { ...options, replaceHistoryState: true } :
      options;
    const shouldDisplay = !options?.renderOnly && pathToDisplay.equals(lastPath);
    if (shouldDisplay) return displayPath(
      pathToDisplay,
      linkToSelect,
      displayOptions
    );
  }).catch(e => console.error(e));
}

export default updateView;
