import fetchAndRenderPath from 'render/fetch_and_render_path';
import displayPath from 'display/display_path';
import {
  defaultTopic,
  canopyContainer,
  childSectionElementOfParentLink
} from 'helpers/getters';

const updateView = (path, displayOptions) => {
  let newTreeAppended = fetchAndRenderPath(path, canopyContainer, true);

  newTreeAppended.then(() => {
    displayPath(
      path,
      displayOptions
    );
  });
}

export default updateView;
