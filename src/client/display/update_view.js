import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import { defaultTopic, canopyContainer } from 'helpers/getters';

const updateView = (pathToDisplay, linkToSelect, displayOptions) => {
  validatePathAndLink(pathToDisplay, linkToSelect);

  let newTreeAppended = fetchAndRenderPath(pathToDisplay, canopyContainer);

  newTreeAppended.then(() => {
    displayPath(
      pathToDisplay,
      linkToSelect,
      displayOptions
    );
  });
}

function validatePathAndLink(pathToDisplay, linkToSelect) {
  if (!(pathToDisplay instanceof Path)) throw "Invalid path argument";
  if (linkToSelect && !(linkToSelect instanceof Link)) throw "Invalid link selection argument";
}

export default updateView;