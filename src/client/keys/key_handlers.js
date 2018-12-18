import {
  currentSection,
  selectedLink,
  currentRootSection,
  linkNumberOf,
  sectionElementOfLink,
  parentLinkOfSection,
  sectionElementOfPath
} from 'helpers/getters';
import {
  parentLinkOf,
  firstLinkOfSection,
  linkAfter,
  linkBefore,
  firstSiblingOf,
  lastSiblingOf,
  firstChildLinkOfParentLink,
  isTopicRootSection,
  isTreeRootSection
} from 'helpers/relationships';
import updateView from 'render/update_view';
import setPathAndFragment from 'path/set_path';
import displayPath from 'display/display_path';
import parsePathString from 'path/parse_path_string';
import { deselectAllLinks } from 'display/reset_page';

function moveUpward() {
  // TODO: If root, unselect link

  var linkElement = parentLinkOf(selectedLink()) ||
    firstLinkOfSection(currentRootSection());

    var pathArray = parsePathString();

    if (isTreeRootSection(sectionElementOfLink(selectedLink()))) {
      var sectionElement = sectionElementOfLink(selectedLink());
      pathArray = [[
        sectionElement.dataset.topicName,
        sectionElement.dataset.topicName
      ]];

      linkElement = null;
    } else if (isTopicRootSection(sectionElementOfLink(selectedLink()))) {
      pathArray.pop();
    } else {
      var finalTuple = pathArray.pop();
      var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
      pathArray.push(newTuple);
    }

    displayPath(
      pathArray,
      linkElement
    );
}

function moveDownward(cycle) {
  var pathArray = parsePathString();

  if (selectedLink().classList.contains('canopy-redundant-parent-link')) {
    var finalTuple = pathArray.pop();
    var newTuple = [finalTuple[0], selectedLink().dataset.targetSubtopic];
    pathArray.push(newTuple);
    var linkElement = parentLinkOfSection(sectionElementOfPath(pathArray));

    displayPath(
      pathArray,
      linkElement
    );
  }

  var linkElement =
    firstChildLinkOfParentLink(selectedLink()) ||
    (cycle ? linkAfter(selectedLink()) : null) ||
    (cycle ? firstSiblingOf(selectedLink()) : null) ||
    selectedLink();

  if (selectedLink().classList.contains('canopy-global-link')) {
    pathArray.push([
      selectedLink().dataset.targetTopic,
      selectedLink().dataset.targetSubtopic
    ]);

    return updateView(
      pathArray,
      null,
      true
    );
  } else {
    var finalTuple = pathArray.pop();
    var newTuple = [finalTuple[0], linkElement.dataset.urlSubtopic];
    pathArray.push(newTuple);
  }

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
  pathArray.push(newTuple);

  displayPath(
    pathArray,
    linkElement
  );
}

function moveDownOrRedirect() {
  if (selectedLink().classList.contains('canopy-parent-link') ||
      selectedLink().classList.contains('canopy-redundant-parent-link')) {
    moveDownward(false);
  } else if (selectedLink().classList.contains('canopy-global-link')) {
    var pathArray = [[
      selectedLink().dataset.targetTopic,
      selectedLink().dataset.targetSubtopic
    ]];

    updateView(
      pathArray,
      null,
      true
    );
  }
}

export {
  moveUpward,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect
};
