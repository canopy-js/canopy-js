import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';
import { scrollElementToPosition } from 'display/helpers';

function topicParentLink() {
  let link = Link.selection;
  let newLink = Link.lastSelectionOfParagraph(link.enclosingParagraph.topicParagraph.parentParagraph) ||
    link.enclosingParagraph.topicParagraph.parentLink;

  return newLink?.select() || Link.deselect();
}

function moveToParent() {
  let link = Link.selection;
  let parentLink = link && link.parentLink && Link.lastSelectionOfParagraph(link.parentLink?.enclosingParagraph) || link.parentLink;
  let selectionInRootParagraph = !parentLink;

  if (selectionInRootParagraph && !link.isVisible) {
    let sectionElement = Link.selection.enclosingParagraph.sectionElement;
    return scrollElementToPosition(sectionElement, {targetRatio: 0.75, maxScrollRatio: 0.5, minDiff: 0, direction: 'up', behavior: 'smooth'});
  }

  if (selectionInRootParagraph && link.isVisible) {
    return updateView(link.enclosingParagraph.path); // deselect link
  }

  if (parentLink && !parentLink.isVisible) {
    return scrollElementToPosition(parentLink.element, {targetRatio: 0.3, maxScrollRatio: 0.5, minDiff: 50, direction: 'up', behavior: 'smooth'})
      .then(() => { 
        if (parentLink.isFocused) {
          return parentLink.select({ noScroll: true });
        }
      });
  }

  if (parentLink && parentLink.isVisible) {
    return link.parentLink.select();
  }
}

function moveDownOrRedirect({ newTab, altKey, shiftKey }) {
  let firstChild = !Link.selection.isClosedCycle && Link.selection.firstChild;

  if (firstChild && firstChild.isBelowViewport && !Link.selection.isPathReference) {
    return scrollElementToPosition(firstChild.element, {targetRatio: 0.25, maxScrollRatio: 0.5, minDiff: 50, direction: 'down', behavior: 'smooth', side: 'bottom'});
  }

  if (firstChild && firstChild.isAboveViewport && !Link.selection.isPathReference) {
    return scrollElementToPosition(firstChild.element, {targetRatio: 0.25, maxScrollRatio: 0.5, minDiff: 50, direction: 'up', behavior: 'smooth', side: 'bottom'});
  }

  if (Link.selection.isParent && !Link.selection.hasChildren && !Link.selection.cycle && !Link.selection.isPathReference) {
    let sectionElement = Link.selection.targetParagraph.sectionElement;
    return scrollElementToPosition(sectionElement, {targetRatio: 0.2, maxScrollRatio: 0.5, minDiff: 50, direction: 'down', behavior: 'smooth', side: 'bottom'});
  }

  if (firstChild && firstChild.isVisible && !firstChild.isSelected && !newTab && !Link.selection.isPathReference) { // selectALink
    return firstChild.select({ newTab, redirect: altKey, inlineCycles: shiftKey });
  }

  return Link.selection.execute({ newTab, redirect: altKey, inlineCycles: shiftKey });
}

function inlineACycleLink() {
  if (!Link.selection.isCycle) return moveDownOrRedirect();
  return Link.selection.execute({ inlineCycles: true });
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
  let relativeLinkNumber = Link.selection.relativeLinkNumber;

  return Link.selection?.inlinePath.lastSegment.display({ renderOnly: true }).then(() => {
    Link.from(() => Link.selection?.inlinePath.lastSegment.parentParagraph.nthLink(relativeLinkNumber)).select({ scrollStyle: 'instant' });
  });
}

function removeSelection() {
  return updateView(Path.current.firstTopicPath, null, { scrollStyle: 'instant' });
}

function duplicate() {
  return window.open(window.location.href, '_blank');
}

export {
  moveToParent,
  moveDownOrRedirect,
  inlineACycleLink,
  topicParentLink,
  zoomOnLocalPath,
  removeSelection,
  duplicate,
  copyDecodedUrl,
  goToDefaultTopic
};
