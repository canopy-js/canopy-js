import { canopyContainer } from 'helpers/getters';

import updateView from 'display/update_view';
import { deselectAllLinks } from 'display/helpers';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';

function moveUpward(option) {
  let link = Link.selection;

  if (option) {
    let newLink = link.enclosingParagraph.topicParagraph.parentLink

    return updateView(
      newLink.pathToDisplay,
      newLink
    );
  }

  if (link.enclosingParagraph.equals(Paragraph.pageRoot)) {
    return updateView(link.enclosingParagraph.path); // deselect link
  }

  return updateView(
    link.parentLink.pathToDisplay,
    link.parentLink
  );
}

function moveDownward() {
  let path = Path.current;
  let oldLink = Link.selection;
  let newLink;

  if (oldLink.isParent) {

    if (oldLink.isImport) {
      return updateView(
        oldLink.pathToDisplay,
        oldLink.targetParagraph.parentLink
      );
    }

    let newLink = oldLink.targetParagraph.firstLink || oldLink.targetParagraph.parentLink;

    return updateView(
      newLink.pathToDisplay,
      newLink
    );
  }
}

function moveLeftward() {
  let link = Link.selection.previousSibling || Link.selection.lastSibling;
  return updateView(
    link.pathToDisplay,
    link,
  );
}

function moveRightward() {
  let link = Link.selection.nextSibling || Link.selection.firstSibling;

  return updateView(
    link.pathToDisplay,
    link,
  );
}

function moveDownOrRedirect(newTab, altKey) {
  if (Link.selection.isLocal) {
    return moveDownward();
  }

  if (Link.selection.isGlobalOrImport && altKey) { //inline topic
    return moveDownward();
  }

  if (Link.selection.isGlobalOrImport && !altKey) { // redirecting to new page
    let path = Link.selection.targetPath.lastSegment;

    if (newTab) {
      return window.open(
        location.origin + path.string,
        '_blank'
      );
    } else {
      return updateView(
        path,
        Link.selectALink
      ).catch((e) => {
        console.error('No link on new page to select');
        updateView(path);
      });
    }
  }

  if (Link.selection.type === 'url') {
    if (newTab) {
      return window.open(
        Link.selection.element.href,
        '_blank'
      );
    } else {
      window.location = Link.selection.element.href;
    }
  }
}

function depthFirstSearch(dfsDirectionInteger) {
  let link = Link.selection;

  // Open a parent link
  if (link.isLocal && link.isClosed) {
    return updateView(
      Path.current.replaceTerminalSubtopic(link.targetSubtopic),
      link.firstChildLink || link,
    );
  }

  // Close a parent link
  if (link.isLocal && link.isClosed && !link.targetParagraph.hasLinks) {
    return updateView(
      Path.current.replaceTerminalSubtopic(link.targetSubtopic),
      link.parentLink.nextSibling || link.grandParentLink,
    );
  }

  if (link.isGlobalOrImport) {
    let linkToSelect = link.parentLink.nextSibling || link.grandParentLink;
    return updateView(
      linkToSelect.enclosingParagraph.path,
      { linkToSelect }
    );
  }

  // Move to the next sibling including parent link with no children
  if (dfsDirectionInteger === 1 && link.nextSibling && !link.nextSibling.equals(link)) {
    return updateView(
      link.nextSibling.enclosingParagraph.path,
      link.nextSibling,
    );
  }

  if (dfsDirectionInteger === -1 && link.previousSibling && !link.previousSibling.equals(link)) {
    return updateView(
      link.nextSibling.enclosingParagraph.path,
      link.previousSibling,
    );
  }

  // Cycle
  if (dfsDirectionInteger === 1 && link.topicParagraph.lastLink) {
    return updateView(
      Path.current,
      link.firstSibling,
    );
  }

  if (dfsDirectionInteger === -1 && link.topicParagraph.firstLink) {
    return updateView(
      Path.current,
      link.lastSibling,
    );
  }
}

function zoomOnLocalPath() {
  let currentLink = Link.selection;
  let newPath = currentLink.localPathWhenSelected;

  let newLink = new Link(() => currentLink.atNewPath(newPath));

  return updateView(
    newPath,
    newLink,
  );
}

function removeSelection() {
  return updateView(Path.current);
}

export {
  moveUpward,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect,
  depthFirstSearch,
  zoomOnLocalPath,
  removeSelection
};
