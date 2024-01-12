import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';
import { scrollElementToPosition } from 'display/helpers';
import BackButton from 'render/back_button';

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

  if (selectionInRootParagraph && !link.isVisible()) {
    let sectionElement = Link.selection.enclosingParagraph.sectionElement;
    return scrollElementToPosition(sectionElement, {targetRatio: 0.75, maxScrollRatio: 0.5, minDiff: 0, direction: 'up', behavior: 'smooth'});
  }

  if (selectionInRootParagraph && link.isVisible()) {
    return updateView(link.enclosingParagraph.path); // deselect link
  }

  if (parentLink && !parentLink.isVisible()) {
    if (link.isBackButton) BackButton.deselect() || BackButton.disableForSecond();
    return scrollElementToPosition(parentLink.element, {targetRatio: 0.3, maxScrollRatio: 0.5, minDiff: 50, direction: 'up', behavior: 'smooth'});
  }

  if (parentLink && parentLink.isVisible()) {
    return link.parentLink.select();
  }
}

function moveDownOrRedirect({ newTab, altKey, shiftKey }) {
  let firstChild = Link.selection.firstChild;
  if (firstChild && firstChild.isBelowViewport() && !Link.selection.pathReference) {
    return scrollElementToPosition(firstChild.element, {targetRatio: 0.25, maxScrollRatio: 0.5, minDiff: 50, direction: 'down', behavior: 'smooth', side: 'bottom'});
  }

  if (firstChild && firstChild.isAboveViewport() && !Link.selection.pathReference) {
    return scrollElementToPosition(firstChild.element, {targetRatio: 0.25, maxScrollRatio: 0.5, minDiff: 50, direction: 'up', behavior: 'smooth', side: 'bottom'});
  }

  if (Link.selection.isParent && !Link.selection.hasChildren && !Link.selection.cycle && !Link.selection.pathReference) {
    if (BackButton.canBecomeSelected) return BackButton.select();
    let sectionElement = Link.selection.targetParagraph.sectionElement;
    return scrollElementToPosition(sectionElement, {targetRatio: 0.2, maxScrollRatio: 0.5, minDiff: 50, direction: 'down', behavior: 'smooth', side: 'bottom'});
  }

  return Link.selection.execute({ newTab, redirect: altKey, inlineCycles: shiftKey });
}

function inlineACycleLink() {
  if (!Link.selection.isCycle) return moveInDirection('down');
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
  return Link.selection?.enclosingTopicParagraph.pathDown.display();
}

function removeSelection() {
  return updateView(Path.current.rootTopicPath, null);
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
