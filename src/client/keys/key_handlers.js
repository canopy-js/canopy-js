import { canopyContainer } from 'helpers/getters';

import updateView from 'display/update_view';
import { deselectAllLinks } from 'display/helpers';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';

function moveUpward() {
  let path = Path.current;
  let link = Link.selection;
  if (link.isGlobal && link.isOpen && !link.targetParagraph.hasLinks) {
    return updateView(
      path.withoutLastSegment,
      Link.selection,
    );
  }

  if (link.isLocal && link.isOpen && !link.targetParagraph.hasLinks) {
    return updateView(
      Link.selection.enclosingParagraph.path,
      Link.selection,
    );
  }

  if (link.enclosingParagraph.isPageRoot) {
    return updateView(path.rootPath);
  }

  if (link.enclosingParagraph.isTopic) {
    return updateView(
      path.withoutLastSegment,
      link.enclosingParagraph.parentLink,
    );
  }

  if (link.parentLink.isLocal) {
    return updateView(
      link.parentLink.enclosingParagraph.path,
      link.enclosingParagraph.parentLink,
    );
  }
}

function moveDownward(cycle) {
  let path = Path.current;

  if (Link.selection.isGlobal) {
    if (Link.selection.isOpen) { // Handle open global link with no children
      return;
    }

    let newPath = path.addSegment(
      Link.selection.targetTopic,
      Link.selection.targetSubtopic
    );

    return updateView(
      newPath,
      Link.selectALink
    );
  }

  if (Link.selection.isLocal) {
    let newPath = path.replaceTerminalSubtopic(Link.selection.targetSubtopic);

    return updateView(
      newPath,
      Link.selectALink
    );
  }
}

function moveLeftward() {
  moveLaterally(-1);
}

function moveRightward() {
  moveLaterally(1);
}

function moveLaterally(directionInteger) {
  let currentSectionElement = Paragraph.current.sectionElement;
  let newPath = Path.current;

  // handle right on opened global link with no child links
  if (Link.selection.isGlobal && !Paragraph.current.equals(Link.selection.enclosingParagraph)) {
    newPath = path.withoutLastSegment;
  }

  let link;
  if (directionInteger === 1) {
    link = Link.selection.nextSibling || Link.selection.firstSibling;
  } else if (directionInteger === -1) {
    link = Link.selection.previousSibling || Link.selection.lastSibling;
  }

  updateView(
    newPath,
    link,
  );
}

function moveDownOrRedirect(newTab, altKey) {
  if (Link.selection.isLocal) {
    return moveDownward(false);
  }

  if (Link.selection.isGlobal) {
    let path;
    let options;

    if (altKey) { // in-line topic mode
      if (link.isGlobal && link.isOpen && !link.targetParagraph.hasLinks) { // If it is open, close it
        let link = Paragraph.current.parentLink;
        options = Link.selection,
        path = Path.current.withoutLastSegment;

      } { // If it is closed, open it
        path = Path.current.addSegment(
          Link.selection.targetTopic,
          Link.selection.targetSubtopic
        )
      }
    }

    if (!altKey) { // redirecting to new topic page
      path = new Path([[
        Link.selection.targetTopic,
        Link.selection.targetSubtopic
      ]]);
      options = Link.selectALink;
    }

    if (newTab) {
      return window.open(
        location.origin + path.string,
        '_blank'
      );
    }

    updateView(
      path,
      options || Link.selectALink
    );
  } else if (Link.selection.type === 'url') {
    if (newTab) {
      return window.open(
        selectedLink().href,
        '_blank'
      );
    } else {
      window.location = selectedLink().href;
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
  let newPath = Path.current.lastSegment;
  let newlink = new Link(() => newPath.paragraph.links.find(
    (link) => link.targetTopic === currentLink.targetTopic &&
      link.targetSubtopic === currentLink.targetSubtopic &&
      link.relativeLinkNumber === currentLink.relativeLinkNumber
  ));

  return updateView(
    newPath,
    newlink,
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
