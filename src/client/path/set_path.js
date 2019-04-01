import {
  selectedLink,
  documentTitleFor,
  uniqueSubtopic,
  metadataFromLink
} from 'helpers/getters';
import { parsePathString, pathStringFor } from 'path/helpers';

const setPath = (newPathArray) => {
  let oldPathArray = parsePathString();
  let documentTitle = newPathArray[0][0];

  let historyApiFunction = pathStringFor(newPathArray) === pathStringFor(oldPathArray) ?
    replaceState : pushState;

  historyApiFunction(
    metadataFromLink(selectedLink()),
    documentTitle,
    pathStringFor(newPathArray)
  );
}

function replaceState(a, b, c) {
  history.replaceState(a, b, c)
};

function pushState(a, b, c) {
  history.pushState(a, b, c);
};

export default setPath;

