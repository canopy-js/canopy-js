import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';
import { scrollElementToPosition } from 'display/helpers';
import BackButton from 'render/back_button';

function moveToParent() {
  let link = Link.selection;
  let parentLink = link && link.parentLink && Link.lastSelectionOfParagraph(link.parentLink?.enclosingParagraph) || link.parentLink;

  if (!parentLink) { // eg link in root paragraph
    if (!isVisible(link)) {
      let sectionElement = Link.selection.enclosingParagraph.sectionElement;
      scrollElementToPosition(sectionElement, {targetRatio: 0.75, maxScrollRatio: 0.75, minDiff: 0, direction: 'up', behavior: 'smooth'});
    } else {
      if (!link.enclosingParagraph.equals(Paragraph.pageRoot)) throw 'this should never happen';
      return updateView(link.enclosingParagraph.path); // deselect link
    }
  } else { // there is a parent link
    if (!isVisible(parentLink)) {
      if (link.isBackButton) BackButton.deselect() || BackButton.disableForSecond();
      scrollElementToPosition(parentLink.element, {targetRatio: 0.3, maxScrollRatio: 0.75, minDiff: 50, direction: 'up', behavior: 'smooth'});
    } else {
      return updateView(
        link.parentLink.previewPath,
        new Link(() => Link.lastSelectionOfParagraph(link.parentLink.enclosingParagraph) || link.parentLink)
      );
    }
  }
}

function topicParentLink() {
  let link = Link.selection;
  let newLink = Link.lastSelectionOfParagraph(link.enclosingParagraph.topicParagraph.parentParagraph) ||
    link.enclosingParagraph.topicParagraph.parentLink;

  return newLink?.select() || Link.deselect();
}

function moveToChild() {
  let oldLink = Link.selection;

  if (oldLink.isImport && oldLink.isVisible) {
    updateView(
      oldLink.path,
      oldLink.targetParagraph.parentLink
    );
  }

  if ((oldLink.isGlobal || oldLink.isLocal) && oldLink.isVisible) {
    let newLink = oldLink.targetParagraph?.firstLink || oldLink.targetParagraph?.parentLink;

    updateView(
      newLink.path,
      new Link(() => Link.lastSelectionOfParagraph(newLink.enclosingParagraph) || newLink)
    );
  }

  if (!oldLink.isParent && !oldLink.isBackButton && oldLink.isVisible) {
    updateView(
      oldLink.path,
      oldLink
    );
  }

  if (BackButton.canBecomeSelected) {
    BackButton.select();
  }
}

function moveDownOrRedirect({ newTab, altKey, shiftKey }) {
  if (Link.selection.firstChild && isBelowViewport(Link.selection.firstChild.element)) {
    let linkElement = Link.selection.firstChild.element;
    scrollElementToPosition(linkElement, {targetRatio: 0.25, maxScrollRatio: 0.75, minDiff: 50, direction: 'down', behavior: 'smooth', side: 'bottom'});
  } else if (Link.selection.firstChild && isAboveViewport(Link.selection.firstChild.element)) {
    let linkElement = Link.selection.firstChild.element;
    scrollElementToPosition(linkElement, {targetRatio: 0.25, maxScrollRatio: 0.75, minDiff: 50, direction: 'up', behavior: 'smooth', side: 'bottom'});
  } else if (Link.selection.isParent && !Link.selection.hasChildren && !Link.selection.cycle) {
    if (BackButton.canBecomeSelected) return BackButton.select();
    let sectionElement = Link.selection.targetParagraph.sectionElement;
    scrollElementToPosition(sectionElement, {targetRatio: 0.2, maxScrollRatio: 0.75, minDiff: 50, direction: 'down', behavior: 'smooth', side: 'bottom'});
  } else {
    return Link.selection.execute({ newTab, redirect: altKey, inlineCycles: shiftKey })
  }
}

function inlineCycleLink() {
  if (!Link.selection.isCycle) return moveInDirection('down');
  return Link.selection.execute({ inlineCycles: true });
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

function isAboveViewport(linkElement) {
  if (!linkElement || !linkElement.getBoundingClientRect) {
    return false; // Ensures that the provided element is valid and has getBoundingClientRect method
  }

  const rect = linkElement.getBoundingClientRect();
  return rect.top < 0; // Returns true only if the top of the element is above the top of the viewport
}

function isBelowViewport(linkElement) {
  if (!linkElement || !linkElement.getBoundingClientRect) {
    return false; // Ensures that the provided element is valid and has getBoundingClientRect method
  }

  const rect = linkElement.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom > viewportHeight; // Returns true only if the bottom of the element is below the bottom of the viewport
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
  return Path.rendered.lastSegment.display({scrollStyle: 'instant'});
}

function removeSelection() {
  return updateView(Path.current.rootTopicPath, null, { scrollStyle: 'instant' });
}

function duplicate() {
  return window.open(window.location.href, '_blank');
}

export {
  moveToParent,
  moveToChild,
  moveDownOrRedirect,
  inlineCycleLink,
  topicParentLink,
  depthFirstSearch,
  zoomOnLocalPath,
  removeSelection,
  duplicate,
  browserBack,
  copyDecodedUrl,
  goToDefaultTopic
};
