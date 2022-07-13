import { canopyContainer } from 'helpers/getters';

import updateView from 'display/update_view';
import { deselectAllLinks } from 'display/helpers';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';

function moveUpward() {
  let link = Link.selection;

  if (link.enclosingParagraph.equals(Paragraph.pageRoot)) {
    return updateView(link.enclosingParagraph.path); // deselect link
  }

  return updateView(
    link.parentLink.pathToDisplay,
    link.parentLink
  );
}

function topicParentLink() {
  let link = Link.selection;
  let newLink = link.enclosingParagraph.topicParagraph.parentLink

  return updateView(
    newLink?.pathToDisplay || Path.current,
    newLink || link
  );
}

function moveDownward() {
  let { path, link } = downwardPathAndLink();
  return updateView(path, link)
}

function downwardPathAndLink() {
  let path = Path.current;
  let oldLink = Link.selection;
  let newLink;

  if (oldLink.isParent) {

    if (oldLink.isImport) {
      return {
        path: oldLink.pathToDisplay,
        link: oldLink.targetParagraph.parentLink
      }
    }

    let newLink = oldLink.targetParagraph.firstLink || oldLink.targetParagraph.parentLink;

    return {
      path: newLink.pathToDisplay,
      link: newLink
    };
  } else {
    return oldLink;
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
  let path, link;

  if (Link.selection.isLocal && !altKey) { // no zoom
    let { path, link } = downwardPathAndLink();
    if (newTab) {
      return window.open(location.origin + path.string, '_blank');
    } else {
      return updateView(path, link);
    }
  }

  if (Link.selection.isLocal && altKey) { // zoom
    let { path, link } = downwardPathAndLink();
    if (newTab) {
      return window.open(location.origin + path.lastSegment.string, '_blank');
    } else {
      return updateView(path.lastSegment, link.atNewPath(path.lastSegment));
    }
  }

  if (Link.selection.isGlobalOrImport) { // redirect
    let path = Link.selection.targetPath.lastSegment;

    if (newTab) {
      return window.open(location.origin + path.string, '_blank');
    } else {
      return updateView(
        path,
        Link.selectALink(path)
      )
    }
  }

  if (Link.selection.type === 'url') {
    if (newTab) {
      return window.open(Link.selection.element.href, '_blank');
    } else {
      window.location = Link.selection.element.href;
    }
  }
}

function depthFirstSearchForward() {
  let link = Link.selection;

  // Open a parent link
  if (link.isLocal && link.hasChildren) {
    let nextLink = link.firstChildLink || link.nextSibling || link;
    return updateView(
      nextLink.pathToDisplay,
      nextLink
    );
  }

  if (link.isGlobalOrImport) {
    let linkToSelect = link.nextSibling || link.parentLink?.nextSibling || link.enclosingParagraph.firstLink;
    return updateView(
      linkToSelect.enclosingParagraph.path,
      linkToSelect
    );
  }

  // Move to the next sibling including parent link with no children
  if (link.nextSibling && !link.nextSibling.equals(link)) {
    return updateView(
      link.nextSibling.enclosingParagraph.path,
      link.nextSibling,
    );
  }

  // Move to next parent sibling, grandparent sibling, etc.
  if (link.lastSibling.equals(link)) {
    let linkToSelect = (function parentSibling (link) {
      if (!link.parentLink) {
        return link.enclosingParagraph.firstLink; // cycle
      } else if (link.parentLink.nextSibling) {
        return link.parentLink.nextSibling;
      } else {
        return parentSibling(link.parentLink)
      }
    })(link);

    return updateView(
      linkToSelect.pathToDisplay,
      linkToSelect
    );
  }
}

function depthFirstSearchBackward() {
  let link = Link.selection;

  // Open a parent link
  if (link.isLocal && link.hasChildren) {
    let nextLink = link.lastChildLink || link.previousSibling || link;
    return updateView(
      nextLink.pathToDisplay,
      nextLink
    );
  }

  if (link.isGlobalOrImport) {
    let linkToSelect = link.previousSibling || link.parentLink?.previousSibling || link.enclosingParagraph.lastLink;
    return updateView(
      linkToSelect.enclosingParagraph.path,
      linkToSelect
    );
  }

  // Move to the next sibling including parent link with no children
  if (link.previousSibling && !link.previousSibling.equals(link)) {
    return updateView(
      link.previousSibling.enclosingParagraph.path,
      link.previousSibling,
    );
  }

  // Move to next parent sibling, grandparent sibling, etc.
  if (link.firstSibling.equals(link)) {
    let linkToSelect = (function parentSibling (link) {
      if (!link.parentLink) {
        return link.enclosingParagraph.lastLink; // cycle
      } else if (link.parentLink.previousSibling) {
        return link.parentLink.previousSibling;
      } else {
        return parentSibling(link.parentLink)
      }
    })(link);

    return updateView(
      linkToSelect.pathToDisplay,
      linkToSelect
    );
  }

  // Cycle
  if (link.topicParagraph.firstLink) {
    return updateView(
      Path.current,
      link.lastSibling,
    );
  }
}

function zoomOnLocalPath() {
  let currentLink = Link.selection;
  let newPath = currentLink.localPathWhenSelected;

  let newLink = currentLink.atNewPath(newPath);

  return updateView(
    newPath,
    newLink,
  );
}

function removeSelection() {
  return updateView(Path.current.rootTopicPath);
}

export {
  moveUpward,
  topicParentLink,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect,
  depthFirstSearchForward,
  depthFirstSearchBackward,
  zoomOnLocalPath,
  removeSelection
};
