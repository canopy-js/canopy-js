import { canopyContainer } from 'helpers/getters';

import updateView from 'display/update_view';
import { deselectAllLinks } from 'display/helpers';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';

function moveUpward() {
  let link = Link.selection;

  if (link.enclosingParagraph.equals(Paragraph.pageRoot)) {
    return updateView(link.enclosingParagraph.path);
  }

  return updateView(
    link.parentLink.pathWhenSelected,
    link.parentLink
  );
}

function moveDownward() {
  let path = Path.current;
  let oldLink = Link.selection;

  if (oldLink.isParent) {
    let newLink = oldLink.targetParagraph.firstLink;

    if (!newLink){
      return;
    }

    if (newLink.isLocal) {
      return updateView(
        newLink.pathWhenSelected,
        newLink
      );
    }

    if (newLink.isGlobal) {
      return updateView(
        Path.current.addSegment(newLink.targetTopic, newLink.targetTopic),
        Link.selection.targetParagraph.firstLink
      );
    }
  }
}

function moveLeftward() {
  let link = Link.selection.previousSibling || Link.selection.lastSibling;
  return updateView(
    link.pathWhenSelected,
    link,
  );
}

function moveRightward() {
  let link = Link.selection.nextSibling || Link.selection.firstSibling;

  return updateView(
    link.pathWhenSelected,
    link,
  );
}

function moveDownOrRedirect(newTab, altKey) {
  if (Link.selection.isLocal) {
    return moveDownward();
  }

  if (Link.selection.isGlobal) {
    let path;
    let link;

    if (altKey) { // in-line topic mode
      if (Link.selection.targetParagraph.hasLinks) { // select first child link
        link = Link.selection.targetParagraph.firstLink;
        path = Paragraph.current.firstLink.pathWhenSelected;
      } else { // there is nothing in the previewed child to select
        return;
      }
    }

    if (!altKey) { // redirecting to new topic page
      path = Link.selection.targetPath.lastSegment;
      link = Link.selectALink(path);
    }

    if (newTab) {
      return window.open(
        location.origin + path.string,
        '_blank'
      );
    }

    updateView(
      path,
      link
    );
  } else if (Link.selection.type === 'url') {
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

  if (link.isGlobal) {
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
