import { fetchAndRenderPath } from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import { displayPlaceholderSection } from 'display/helpers';
import Path from 'models/path';
import { canopyContainer } from 'helpers/getters';
let lastPath = null; // ensure only the last call gets displayed
let updateViewRequestId = 0;

function debugUpdateView(_requestId, _message, _details = {}) {
  return;
}

const updateView = (pathToDisplay, linkToSelect, options = {}) => {
  const requestId = ++updateViewRequestId;
  debugUpdateView(requestId, 'start', {
    pathToDisplay: pathToDisplay?.string,
    linkText: linkToSelect?.text,
    linkDisplayPath: linkToSelect?.displayPath?.string,
    options
  });

  if (pathToDisplay?.empty) pathToDisplay = Path.default;
  if (!options?.renderOnly && pathToDisplay) {
    lastPath = pathToDisplay;
    debugUpdateView(requestId, 'set lastPath', { pathToDisplay: pathToDisplay.string });
  }

  displayPlaceholderSection(pathToDisplay, linkToSelect, options)
    .then(() => debugUpdateView(requestId, 'placeholder complete', { pathToDisplay: pathToDisplay?.string }))
    .catch(e => console.error(e));

  let renderComplete = pathToDisplay && Promise.resolve()
    .then(() => new Promise(resolve => setTimeout(resolve))) // make gap for placeholder paint
    .then(() => debugUpdateView(requestId, 'fetch/render start', { pathToDisplay: pathToDisplay?.string }))
    .then(() => fetchAndRenderPath(pathToDisplay, pathToDisplay, Promise.resolve(canopyContainer), options))
    .then(result => {
      debugUpdateView(requestId, 'fetch/render complete', { pathToDisplay: pathToDisplay?.string, renderedSectionPath: result?.dataset?.pathString });
      return result;
    })
    .catch(e => console.error(e));

  return Promise.resolve(renderComplete).then(() => {
    let displayOptions = Path.url.equals(pathToDisplay) && Path.lastRenderedPath?.paragraph?.loadingElementVisible ?
      { ...options, replaceHistoryState: true } :
      options;
    const shouldDisplay = !options?.renderOnly && pathToDisplay.equals(lastPath);
    debugUpdateView(requestId, shouldDisplay ? 'final display start' : 'final display skipped', {
      pathToDisplay: pathToDisplay?.string,
      displayOptions,
      renderOnly: options?.renderOnly,
      pathEqualsLastPath: pathToDisplay?.equals(lastPath)
    });
    if (shouldDisplay) return displayPath(
      pathToDisplay,
      linkToSelect,
      displayOptions
    ).then(result => {
      debugUpdateView(requestId, 'final display complete', { pathToDisplay: pathToDisplay?.string });
      return result;
    });
  }).catch(e => console.error(e));
}

export default updateView;
