import {
  selectedLink,
  documentTitleFor,
  uniqueSubtopic,
  metadataForLink
} from 'helpers/getters';
import parsePathString from 'path/parse_path_string';
import pathStringFor from 'path/path_string_for';

const setPath = (newPathArray) => {
  let oldPathArray = parsePathString();
  let documentTitle = newPathArray[0][0];

  let pathUnchanged = pathStringFor(newPathArray) === pathStringFor(oldPathArray);
  let historyApiFunction = pathUnchanged ? replaceState : pushState;

  historyApiFunction(
    metadataForLink(selectedLink()),
    documentTitle,
    pathStringFor(newPathArray)
  );
}

function replaceState(a, b, c) {
  history.replaceState(a, b, c);
};

function pushState(a, b, c) {
  history.pushState(a, b, c);
};

export default setPath;

