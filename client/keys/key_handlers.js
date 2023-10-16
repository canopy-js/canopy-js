import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';

function moveToParent() {
  let link = Link.selection;

  if (link.enclosingParagraph.equals(Paragraph.pageRoot)) {
    return updateView(link.enclosingParagraph.path); // deselect link
  }

  let nextLink = Link.lastSelectionOfParagraph(link.parentLink.enclosingParagraph) || link.parentLink;
  let linkElement = nextLink.element;

  // Use the isVisible function to check visibility.
  if (!isVisible(nextLink)) {
    // Calculate how much scrolling is needed to place the link at 2/3 of the viewport.
    let rect = linkElement.getBoundingClientRect();
    let windowHeight = window.innerHeight;
    let targetPosition = windowHeight * 2 / 3;
    let scrollAmount = rect.top - targetPosition;

    // Limit the scroll to 1/3 of the viewport if it requires more.
    let maxScroll = windowHeight * 0.7;
    if (Math.abs(scrollAmount) > maxScroll) {
      scrollAmount = maxScroll * (scrollAmount < 0 ? -1 : 1);
    }

    // Perform the smooth scroll.
    window.scrollTo({
      top: window.scrollY + scrollAmount,
      behavior: 'smooth'
    });
  } else {
    return updateView(
      link.parentLink.path,
      new Link(() => Link.lastSelectionOfParagraph(link.parentLink.enclosingParagraph) || link.parentLink)
    );
  }
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

function moveToChild() {
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

function moveDownOrRedirect({ newTab, altKey }) {
  let link, path;
  debugger;

  if (Link.selection.isLocal) {
    link = Link.selection.targetParagraph?.firstLink || Link.selection.targetParagraph?.parentLink;
    path = link.path;

    if (newTab) {
      return window.open(location.origin + path, '_blank'); // zoom
    } else if (isVisible(link)) {
      return updateView(path, link); // no zoom
    }
  }

  if (Link.selection.isGlobal) {
    if (!altKey) {
      link =
        Link.lastSelectionOfParagraph(Link.selection.targetParagraph) ||
        Link.selection.targetParagraph?.firstLink;
      path = link.path;
    } else {
      path = Link.selection.targetPath.lastSegment;
    }

    if (newTab) {
      return window.open(location.origin + path.string, '_blank');
    } else if (altKey) {
      return updateView(
        path,
        null,
        { scrollStyle: 'auto' }
      )
    } else if (isVisible(link)) {
      return updateView(path, link);
    }
  }

  if (Link.selection.isImport) {
    if (!altKey) {
      link = Link.selection.targetParagraph?.parentLink;
      path = link.path;
    } else {
      path = Link.selection.targetPath.lastSegment;
    }

    if (newTab) {
      return window.open(location.origin + path.string, '_blank');
    } else if (altKey) {
      return updateView(
        path,
        Link.selection.parentLink.atNewPath(path),
        { scrollStyle: 'auto' }
      )
    } else if (isVisible(link)) {
      return updateView(path);
    }
  }

  if (Link.selection.type === 'url') {
    return window.open(Link.selection.element.href, '_blank');
  }

  // If child link not visible, scroll downwards
  let sectionElement = Link.selection.targetParagraph.sectionElement;
  const sectionRect = sectionElement.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const threeQuartersViewport = viewportHeight * 0.75;
  const distanceToThreeQuarters = sectionRect.bottom - threeQuartersViewport;
  const quarterViewport = viewportHeight * 0.7;
  const minDistance = Math.min(Math.abs(distanceToThreeQuarters), quarterViewport) * Math.sign(distanceToThreeQuarters);
  if (minDistance > 0) {
    window.scrollBy({
      top: minDistance,
      behavior: 'smooth'
    });
  }
}

function isVisible(link) {
  if (!link) return false;
  let linkElement = link.element;
  let rect = linkElement.getBoundingClientRect();
  let windowHeight = window.innerHeight;
  let windowWidth = window.innerWidth;

  // Calculate the area of the element that is visible in the viewport
  let visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
  let visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);

  // Calculate the total area of the element and the area that is visible
  let totalArea = (rect.bottom - rect.top) * (rect.right - rect.left);
  let visibleArea = visibleHeight * visibleWidth;

  // Check if at least 50% of the element is visible
  return (visibleArea / totalArea) >= 0.5;
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

function browserBack() { // an undo for DFS
  let oldPathname = window.location.pathname;
  history.back();
  if (oldPathname !== window.location.pathname) { // we aren't undoing a DFS
    history.forward();
  }
}

function copyDecodedUrl() {
  navigator.clipboard.writeText(decodeURIComponent(window.location));
}

function goToDefaultTopic() {
  return updateView(
    Path.default,
    null
  );
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
  return updateView(Path.current.rootTopicPath, null, { scrollStyle: 'auto' });
}

function duplicate() {
  return window.open(window.location.href, '_blank');
}

export {
  moveToParent,
  moveToChild,
  moveDownOrRedirect,
  topicParentLink,
  depthFirstSearch,
  zoomOnLocalPath,
  removeSelection,
  duplicate,
  browserBack,
  copyDecodedUrl,
  goToDefaultTopic
};
