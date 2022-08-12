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
    link.parentLink.paragraphPathWhenSelected,
    link.parentLink
  );
}

function topicParentLink() {
  let link = Link.selection;
  let newLink = link.enclosingParagraph.topicParagraph.parentLink

  return updateView(
    newLink?.paragraphPathWhenSelected || Path.current,
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
        path: oldLink.paragraphPathWhenSelected,
        link: oldLink.targetParagraph.parentLink
      }
    }

    let newLink = oldLink.targetParagraph?.firstLink || oldLink.targetParagraph?.parentLink;

    return {
      path: newLink.paragraphPathWhenSelected,
      link: newLink
    };
  } else {
    return oldLink;
  }
}

function moveLeftward() {
  let link = Link.selection.previousSibling || Link.selection.lastSibling;
  return updateView(
    link.paragraphPathWhenSelected,
    link
  );
}

function moveRightward() {
  let link = Link.selection.nextSibling || Link.selection.firstSibling;

  return updateView(
    link.paragraphPathWhenSelected,
    link
  );
}

function moveDownOrRedirect(newTab, altKey) {
  console.error('moving down');
  let path, link;

  if (Link.selection.isLocal && !altKey) { // no zoom
    let { path, link } = downwardPathAndLink();
    if (newTab) {
      return window.open(location.origin + Link.selection.targetPath, '_blank');
    } else {
      return updateView(path, link);
    }
  }

  if (Link.selection.isLocal && altKey) { // zoom
    let { path, link } = downwardPathAndLink();
    if (newTab) {
      return window.open(location.origin + Link.selection.targetPath.lastSegment, '_blank');
    } else {
      return updateView(Link.selection.targetPath.lastSegment, link.atNewPath(Link.selection.targetPath.lastSegment));
    }
  }

  if (Link.selection.isGlobal) { // redirect
    let path = Link.selection.targetPath.lastSegment;

    console.error('meta enter');

    if (newTab) {
      console.error('new tab');
      return window.open(location.origin + path.string, '_blank');
    } else {
      console.error('old tab');
      return updateView(
        path,
        Link.selectALink(path)
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
        Link.selection.parentLink.atNewPath(path)
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

function depthFirstSearch() {
  let link = Link.selection;

  // Open a parent link
  if (link.isLocal && link.hasChildren) {
    let nextLink = link.firstChildLink || link.nextSibling || link;
    return updateView(
      nextLink.paragraphPathWhenSelected,
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
      linkToSelect.paragraphPathWhenSelected,
      linkToSelect
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
  depthFirstSearch,
  zoomOnLocalPath,
  removeSelection
};
