import { currentSection, selectedLink, currentRootSection, linkNumberOf, sectionElementOfLink } from 'helpers/getters';
import {
  parentLinkOf,
  firstLinkOfSection,
  linkAfter,
  linkBefore,
  firstSiblingOf,
  lastSiblingOf,
  firstChildLinkOfParentLink
} from 'helpers/relationships';
import updateView from 'render/update_view';
import setPathAndFragment from 'path/set_path';
import displayPath from 'display/display_path';
import parsePathString from 'path/parse_path_array';

function moveUpward() {
  // TODO: If root, unselect link
  var linkElement = parentLinkOf(selectedLink()) ||
    firstLinkOfSection(currentRootSection());

    var pathArray = parsePathString();
    var finalTuple = pathArray.pop();
    var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.pop();
    pathArray.push(newTuple);

    displayPath(
      pathArray,
      linkElement
    );
}

function moveDownward(cycle) {
  // TODO handle redundant parent links
  var linkElement =
    firstChildLinkOfParentLink(selectedLink()) ||
    (cycle ? linkAfter(selectedLink()) : null) ||
    (cycle ? firstSiblingOf(selectedLink()) : null) ||
    selectedLink();

  var pathArray = parsePathString();
  var finalTuple = pathArray.pop();
  var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.push(newTuple);

  displayPath(
    pathArray,
    linkElement
  );
}

function moveLeftward() {
  var linkElement = linkBefore(selectedLink()) || lastSiblingOf(selectedLink());

  var pathArray = parsePathString();
  var finalTuple = pathArray.pop();
  var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.pop();
  pathArray.push(newTuple);

  displayPath(
    pathArray,
    linkElement
  );
}

function moveRightward() {
  var linkElement = linkAfter(selectedLink()) || firstSiblingOf(selectedLink());

  var pathArray = parsePathString();
  var finalTuple = pathArray.pop();
  var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
  pathArray.pop();
  pathArray.push(newTuple);

  displayPath(
    pathArray,
    linkElement
  );
}

function moveDownOrRedirect() {
  var pathArray = parsePathString();
  var finalTuple = pathArray.pop();
  var newTuple = [
    selectedLink().dataset.targetTopic,
    selectedLink().dataset.targetSubtopic
  ];
  pathArray.pop();
  pathArray.push(newTuple);

  if (selectedLink().classList.contains('canopy-parent-link')) {
    moveDownward(false);
  } else if (selectedLink().classList.contains('canopy-global-link')) {
    updateView(
      pathArray,
      null,
      true
    );
  } else if (selectedLink().classList.contains('canopy-redundant-parent-link')) {
    updateView(
      pathArray
    );
  } else if (selectedLink().classList.contains('canopy-converted-global-link')) {
    //
  } else if (selectedLink().classList.contains('canopy-painted-global-link')) {
    // updateView(
    //   pathArray.push

    // );
  }
}

function paintGlobalLinks() {
  Array.from(document.getElementsByClassName('canopy-global-link')).forEach((el) => {
    el.classList.add('canopy-painted-global-link');
  });
}

function unpaintGlobalLinks() {
  Array.from(document.getElementsByClassName('canopy-global-link')).forEach((el) => {
    el.classList.remove('canopy-painted-global-link');
  });
}

export {
  moveUpward,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect,
  paintGlobalLinks,
  unpaintGlobalLinks
};
