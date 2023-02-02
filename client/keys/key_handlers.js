import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';

function moveUpward() {
  let link = Link.selection;

  if (link.enclosingParagraph.equals(Paragraph.pageRoot)) {
    return updateView(link.enclosingParagraph.path); // deselect link
  }

  return updateView(
    link.parentLink.path,
    new Link(() => Link.lastSelectionOfParagraph(link.parentLink.enclosingParagraph) || link.parentLink)
  );
}

function topicParentLink() {
  let link = Link.selection;
  let newLink = Link.lastSelectionOfParagraph(link.enclosingParagraph.topicParagraph.parentParagraph) ||
    link.enclosingParagraph.topicParagraph.parentLink;

  return updateView(
    newLink?.path || Path.current,
    newLink || link
  );
}

function moveDownward() {
  let oldLink = Link.selection;

  if (oldLink.isImport) {
    updateView(
      oldLink.path,
      oldLink.targetParagraph.parentLink
    );
  }

  if (oldLink.isGlobal || oldLink.isLocal) {
    let newLink = oldLink.targetParagraph?.firstLink || oldLink.targetParagraph?.parentLink;

    updateView(
      newLink.path,
      new Link(() => Link.lastSelectionOfParagraph(newLink.enclosingParagraph) || newLink)
    );
  }

  if (!oldLink.isParent) {
    updateView(
      oldLink.path,
      oldLink
    );
  }
}

function moveLeftward() {
  let link = Link.selection.previousSibling || Link.selection.lastSibling;
  return updateView(
    link.path,
    link
  );
}

function moveRightward() {
  let link = Link.selection.nextSibling || Link.selection.firstSibling;

  return updateView(
    link.path,
    link
  );
}

function moveDownOrRedirect({ newTab, altKey }) {
  if (Link.selection.isLocal) {
    let link = Link.selection.targetParagraph?.firstLink || Link.selection.targetParagraph?.parentLink;
    let path = link.path;

    if (newTab) {
      return window.open(location.origin + Link.selection.targetPath.lastSegment, '_blank'); // zoom
    } else {
      return updateView(path, link); // no zoom
    }
  }

  if (Link.selection.isGlobal) {
    if (newTab) { // open link at new path in new tab
      let path = Link.selection.targetPath.lastSegment;
      return window.open(location.origin + path.string, '_blank');
    }

    if (!newTab) {
      let path = Link.selection.targetPath.lastSegment;
      return updateView(
        path,
        null,
        { scrollStyle: 'auto' }
      )
    }
  }

  if (Link.selection.isImport) { // redirect
    let path = Link.selection.targetPath.lastSegment;

    if (newTab) {
      return window.open(location.origin + path.string, '_blank');
    } else {
      return updateView(
        path,
        Link.selection.parentLink.atNewPath(path),
        { scrollStyle: 'auto' }
      )
    }
  }

  if (Link.selection.type === 'url') {
    return window.open(Link.selection.element.href, '_blank');
  }
}

function depthFirstSearch() {
  let link = Link.selection;

  // Open a parent link
  if (link.isLocal && link.hasChildren) {
    let nextLink = link.firstChildLink || link.nextSibling || link;
    return updateView(
      nextLink.path,
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
      if (!(link.parentLink && link.parentLink.isLocal)) { // If there is no parent link that is local
        return link.firstSibling; // cycle
      } else if (link.parentLink.nextSibling) { // If there is a parent-sibling link select that
        return link.parentLink.nextSibling;
      } else {
        return parentSibling(link.parentLink) // otherwise repeat the above steps using the local parent link
      }
    })(link);

    return updateView(
      linkToSelect.path,
      linkToSelect
    );
  }
}

function zoomOnLocalPath() {
  let currentLink = Link.selection;
  let newPath = currentLink.localPathSegmentWhenSelected;

  let newLink = currentLink.atNewPath(newPath);

  return updateView(
    newPath,
    newLink,
    { scrollStyle: 'auto' }
  );
}

function removeSelection() {
  return updateView(Path.current.rootTopicPath);
}

function duplicate() {
  return window.open(window.location.href, '_blank');
}

export {
  moveUpward,
  topicParentLink,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect,
  depthFirstSearch,
  zoomOnLocalPath,
  removeSelection,
  duplicate
};
