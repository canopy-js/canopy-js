import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';
import { scrollElementToPosition } from 'display/helpers';
import ScrollableContainer from 'helpers/scrollable_container';

function moveInDirection(direction, options) {
  const currentLinkElement = Link.selection?.element;

  if (direction === 'up') {
    if (!currentLinkElement /*&& Link.visible.length > 1*/) { // up shouldn't go down but should select a link unless none are visible
      // return Path.rendered.selectALink({ direction: 'up' });
      // Actually do nothing because its the wrong direction
      // And even if no visible links, we should return because lower code will error with no selection
      return;
    }
    let candidateLinks = Array.from(document.querySelectorAll('.canopy-selectable-link')).filter(link => link.offsetParent !== null);
    let currentSelectionHigherRect = getBoundingRectInDirection(currentLinkElement, 'up');
    let currentSelectionLowerRect = getBoundingRectInDirection(currentLinkElement, 'down');
    let rectContainers = getRectsOfElements(candidateLinks, currentLinkElement);

    let candidateRectContainers = rectContainers
      .filter(rect => isHigher(rect, currentSelectionLowerRect)
        && !isVerticallyOverlapping(rect, currentSelectionLowerRect)
        && rect.element !== currentLinkElement);

    if (candidateRectContainers.length === 0) {
      if (currentSelectionLowerRect.top < -10) {
        return scrollElementToPosition(currentLinkElement, {targetRatio: 0.25, maxScrollRatio: 0.5, minDiff: 50, direction: 'up', behavior: 'smooth'});
      } else {
        return Path.root.display();
      }
    }

    let lowestHigherRect = candidateRectContainers
      .reduce((lowestHigherRect, newRect) => {
        let bestLink = Link.for(lowestHigherRect.element);
        let newLink = Link.for(newRect.element);

        // Prefer parent within higher paragraph
        if (newLink.siblingOf(bestLink) && bestLink.isParentLinkOf(Link.selection.enclosingParagraph)) return lowestHigherRect;
        if (bestLink.siblingOf(newLink) && Link.for(newRect.element).isParentLinkOf(Link.selection?.enclosingParagraph)) return newRect;

        if (isLower(lowestHigherRect, newRect) && // of those links that are higher than current selection, prefer lower if noticeable
          !isVerticallyOverlapping(lowestHigherRect, newRect) &&
          !isVerticallyOverlapping(lowestHigherRect, currentSelectionLowerRect)) return lowestHigherRect;

        if (isLower(newRect, lowestHigherRect) &&
          !isVerticallyOverlapping(lowestHigherRect, newRect) &&
          !isVerticallyOverlapping(newRect, currentSelectionLowerRect)) return newRect;

        if (isHorizontallyWithin(currentSelectionHigherRect, lowestHigherRect)) return lowestHigherRect;
        if (isHorizontallyWithin(currentSelectionHigherRect, newRect)) return newRect;
        if (isHorizontallyWithin(lowestHigherRect, currentSelectionHigherRect) && !isHorizontallyWithin(newRect, currentSelectionHigherRect)) return lowestHigherRect;
        if (isHorizontallyWithin(newRect, currentSelectionHigherRect) && !isHorizontallyWithin(lowestHigherRect, currentSelectionHigherRect)) return newRect;

        if (isHorizontallyOverlapping(lowestHigherRect, currentSelectionHigherRect) && !isHorizontallyOverlapping(newRect, currentSelectionHigherRect)) return lowestHigherRect;
        if (isHorizontallyOverlapping(newRect, currentSelectionHigherRect) && !isHorizontallyOverlapping(lowestHigherRect, currentSelectionHigherRect)) return newRect;

        if (lowestHigherRect.element.closest('p.canopy-paragraph') === Link.selection.parentLink.enclosingParagraph.paragraphElement) { // going up to new paragraph
          if (isHorizontallyOverlapping(lowestHigherRect, currentSelectionHigherRect) && isHorizontallyOverlapping(newRect, currentSelectionHigherRect)) {
            return greaterHorizontalOverlap(currentSelectionHigherRect, lowestHigherRect, newRect);
          } else {
            return horizontallyCloserRect(lowestHigherRect, newRect, currentSelectionHigherRect);
          }
        } else { // going up in same paragraph
          if (isHorizontallyOverlapping(lowestHigherRect, currentSelectionLowerRect) && isHorizontallyOverlapping(newRect, currentSelectionLowerRect)) {
            return greaterHorizontalOverlap(currentSelectionLowerRect, lowestHigherRect, newRect);
          } else {
            return horizontallyCloserRect(lowestHigherRect, newRect, currentSelectionLowerRect);
          }
        }
      });

    scrollOrSelect(lowestHigherRect, { direction: 'up'} );

  } else if (direction === 'down') {
    if (!currentLinkElement) return Path.rendered.selectALink({ direction: 'down' });

    let candidateLinks = Array.from(document.querySelectorAll('.canopy-selectable-link')).filter(link => link.offsetParent !== null && isVisible(link));
    let currentSelectionHigherRect = getBoundingRectInDirection(currentLinkElement, 'up');
    let currentSelectionLowerRect = getBoundingRectInDirection(currentLinkElement, 'down');
    let rectContainers = getRectsOfElements(candidateLinks, currentLinkElement);

    let candidateRectContainers = rectContainers
      .filter(rect => isLower(rect, currentSelectionHigherRect)
        && !isVerticallyOverlapping(rect, currentSelectionHigherRect)
        && isInViewportVertically(rect)
        && rect.element !== currentLinkElement);

    if (candidateRectContainers.length === 0) {
      let sectionElement = Paragraph.current.sectionElement;
      return scrollElementToPosition(sectionElement, {targetRatio: 0.05, maxScrollRatio: 0.5, minDiff: 50, direction: 'down', behavior: 'smooth', side: 'bottom'});
    }

    let highestLowerRect = candidateRectContainers
      .reduce((highestLowerRect, newRect) => {
        let bestLink = Link.for(highestLowerRect.element);
        let newLink = Link.for(newRect.element);

        // prefer previous selection of paragraph
        if (newLink.isLastSelection && bestLink.siblingOf(newLink)) return newRect;
        if (bestLink.isLastSelection && newLink.siblingOf(bestLink)) return highestLowerRect;

        // going down to new paragraph, prefer first link rather than geometrically proximate
        // if (newLink.firstChildOf(Link.selection) && bestLink.siblingOf(newLink)) return newRect;
        // if (bestLink.firstChildOf(Link.selection) && newLink.siblingOf(bestLink)) return highestLowerRect;

        // If we are previewing a path reference, 'down' should take us down the open path
        // if (bestLink.isOpen) return highestLowerRect; // actually, this is confusing because it makes other links in the current P unreachable
        // if (newLink.isOpen) return newRect;

        if (isHigher(highestLowerRect, newRect) &&
          !isVerticallyOverlapping(highestLowerRect, newRect) &&
          !isVerticallyOverlapping(highestLowerRect, currentSelectionHigherRect)) return highestLowerRect; // prefer the higher element if noticeably higher

        if (isHigher(newRect, highestLowerRect) &&
          !isVerticallyOverlapping(highestLowerRect, newRect) &&
          !isVerticallyOverlapping(newRect, currentSelectionHigherRect)) return newRect;

        if (isHorizontallyWithin(currentSelectionHigherRect, highestLowerRect)) return highestLowerRect;
        if (isHorizontallyWithin(currentSelectionHigherRect, newRect)) return newRect;
        if (isHorizontallyWithin(highestLowerRect, currentSelectionHigherRect) && !isHorizontallyWithin(newRect, currentSelectionHigherRect)) return highestLowerRect;
        if (isHorizontallyWithin(newRect, currentSelectionHigherRect) && !isHorizontallyWithin(highestLowerRect, currentSelectionHigherRect)) return newRect;

        if (highestLowerRect.element.closest('p.canopy-paragraph') === Link.selection?.targetParagraph?.paragraphElement) { // going down into new paragraph
          if (isHorizontallyOverlapping(highestLowerRect, currentSelectionLowerRect) && !isHorizontallyOverlapping(newRect, currentSelectionLowerRect)) return highestLowerRect;
          if (isHorizontallyOverlapping(newRect, currentSelectionLowerRect) && !isHorizontallyOverlapping(highestLowerRect, currentSelectionLowerRect)) return newRect;
          if (Paragraph.current.links[0].element === highestLowerRect.element) return highestLowerRect; // prefer first link if it is close
          if (Paragraph.current.links[0].element === newRect.element) return newRect;
          return greaterHorizontalOverlap(currentSelectionHigherRect, highestLowerRect, newRect);
        } else { // going down in same paragraph
          if (isHorizontallyOverlapping(highestLowerRect, currentSelectionHigherRect) && !isHorizontallyOverlapping(newRect, currentSelectionHigherRect)) return highestLowerRect;
          if (isHorizontallyOverlapping(newRect, currentSelectionHigherRect) && !isHorizontallyOverlapping(highestLowerRect, currentSelectionHigherRect)) return newRect;
          return greaterHorizontalOverlap(currentSelectionLowerRect, highestLowerRect, newRect);
        }
      });

    scrollOrSelect(highestLowerRect, { direction: 'down'} );

  } else if (direction === 'left') {
    let candidateLinks = Link.selection.element.closest('p.canopy-paragraph').querySelectorAll('.canopy-selectable-link');
    let currentSelectionRect = getBoundingRectInDirection(currentLinkElement, 'right');
    let rectContainers = getRectsOfElements(candidateLinks, currentLinkElement);

    let candidateRectContainers = rectContainers.filter(rectObject => rectObject.right < currentSelectionRect.right);
    candidateRectContainers = candidateRectContainers.filter(rectObject => isVerticallyOverlapping(rectObject, currentSelectionRect));
    candidateRectContainers = candidateRectContainers.filter(rectObject => rectObject.element !== currentLinkElement);

    if (candidateRectContainers.length > 0) {
      let rightmostLeftRect = candidateRectContainers
        .reduce((rightmostLeftRect, newRect) => {
          if (rightmostLeftRect.bottom === currentSelectionRect.bottom && newRect.bottom !== currentSelectionRect.bottom) return rightmostLeftRect; // prefer direct left
          if (newRect.bottom === currentSelectionRect.bottom && rightmostLeftRect.bottom !== currentSelectionRect.bottom) return newRect;
          if (rightmostLeftRect.right > newRect.right) return rightmostLeftRect;
          if (rightmostLeftRect.right < newRect.right) return newRect;
          if (rightmostLeftRect.right === newRect.right) {
            let yDistanceFromCurrentToBest = distanceComparingSide(currentSelectionRect, rightmostLeftRect, 'bottom');
            let yDistanceFromCurrentToNew = distanceComparingSide(currentSelectionRect, newRect, 'bottom');
            return yDistanceFromCurrentToBest > yDistanceFromCurrentToNew ? newRect : rightmostLeftRect;
          }
        });

      if (rightmostLeftRect) {
        return scrollOrSelect(rightmostLeftRect);
      }
    }

    // Wrap to upward far-right for LTR (or downward far-left for rtl)
    let verticalDirectionOfWrap = verticalDirectionToWrapAfterLeftmostLink(currentLinkElement);
    let horizontalDirectionOfWrap = horizontalDirectionToWrapAfterLink(currentLinkElement, verticalDirectionOfWrap);
    let verticalSideToCompare = verticalDirectionOfWrap === 'up' ? 'bottom' : 'top';
    let isInCorrectVerticalDirection = verticalDirectionOfWrap === 'up' ? isHigher : isLower; // has to be eg upward in general
    let isInBetterVerticalDirection = verticalDirectionOfWrap === 'up' ? isLower : isHigher; // but of the upward links, eg, lower is better
    let closerToCorrectHorizontalEdge = horizontalDirectionOfWrap === 'right' ? rightMostRect : leftMostRect;

    candidateRectContainers = rectContainers.filter(rectObject => isInCorrectVerticalDirection(rectObject, currentSelectionRect));
    candidateRectContainers = candidateRectContainers.filter(rectObject => !isVerticallyOverlapping(rectObject, currentSelectionRect)); // if left and right accept overlap wrap must not
    candidateRectContainers = candidateRectContainers.filter(rectObject => rectObject.element !== currentLinkElement);

    if (candidateRectContainers.length > 0) {
      let rightmostUpwardRect = candidateRectContainers // name reflects LTR text
        .reduce((rightmostUpwardRect, newRect) => {
          if (isInBetterVerticalDirection(rightmostUpwardRect, newRect) && !isVerticallyOverlapping(rightmostUpwardRect, newRect)) return rightmostUpwardRect;
          if (isInBetterVerticalDirection(newRect, rightmostUpwardRect) && !isVerticallyOverlapping(rightmostUpwardRect, newRect)) return newRect;
          return closerToCorrectHorizontalEdge(rightmostUpwardRect, newRect);
        });

      if (rightmostUpwardRect) {
        return scrollOrSelect(rightmostUpwardRect);
      }
    }

    // Wrap to rightmost bottom (or leftmost top for RTL)
    let verticalDirectionOfExtremeWrap = verticalDirectionToWrapAfterFinalLeftmostLink(currentLinkElement);
    let horizontalDirectionOfExtremeWrap = horizontalDirectionToWrapAfterExtremeLink(currentLinkElement, verticalDirectionOfExtremeWrap);
    let verticalSideToCompareExtremeWrap = verticalDirectionOfExtremeWrap === 'down' ? 'top' : 'bottom';
    let horizontalSideToCompareExtremeWrap = horizontalDirectionOfExtremeWrap;
    let isVerticallyFarther = verticalDirectionOfExtremeWrap === 'up' ? isHigher : isLower;
    let closerToCorrectExtremeHorizontalEdge = horizontalDirectionOfExtremeWrap === 'right' ? rightMostRect : leftMostRect;

    let rightBottomMostRect = rectContainers // Name reflects LTR text
      .reduce((rightBottomMostRect, newRect) => {
        if (isVerticallyFarther(rightBottomMostRect, newRect)  && !isVerticallyOverlapping(rightBottomMostRect, newRect)) return rightBottomMostRect;
        if (isVerticallyFarther(newRect, rightBottomMostRect) &&  !isVerticallyOverlapping(rightBottomMostRect, newRect)) return newRect;
        return closerToCorrectExtremeHorizontalEdge(rightBottomMostRect, newRect);
      });

    if (rightBottomMostRect) {
      return scrollOrSelect(rightBottomMostRect);
    }

  } else if (direction === 'right') {
    let candidateLinks = Link.selection.element.closest('p.canopy-paragraph').querySelectorAll('.canopy-selectable-link');
    let currentSelectionRect = getBoundingRectInDirection(currentLinkElement, 'left');
    let rectContainers = getRectsOfElements(candidateLinks, currentLinkElement);

    let candidateRectContainers = rectContainers.filter(rectObject => rectObject.left > currentSelectionRect.left);
    candidateRectContainers = candidateRectContainers.filter(rectObject => isVerticallyOverlapping(rectObject, currentSelectionRect));
    candidateRectContainers = candidateRectContainers.filter(rectObject => rectObject.element !== currentLinkElement);

    if (candidateRectContainers.length > 0) {
      let leftmostRightRect = candidateRectContainers
        .reduce((leftmostRightRect, newRect) => {
          if (leftmostRightRect.bottom === currentSelectionRect.bottom && newRect.bottom !== currentSelectionRect.bottom) return leftmostRightRect; // prefer direct right
          if (newRect.bottom === currentSelectionRect.bottom && leftmostRightRect.bottom !== currentSelectionRect.bottom) return newRect;
          if (leftmostRightRect.left < newRect.left) return leftmostRightRect;
          if (leftmostRightRect.left > newRect.left) return newRect;
          if (leftmostRightRect.left === newRect.left) {
            return topMostRect(leftmostRightRect, newRect);
          }
        });

      if (leftmostRightRect) {
        return scrollOrSelect(leftmostRightRect);
      }
    }

    // Wrap to downward far-left (or upward far-right for RTL text)
    let verticalDirectionOfWrap = verticalDirectionToWrapAfterRightmostLink(currentLinkElement);
    let horizontalDirectionOfWrap = horizontalDirectionToWrapAfterLink(currentLinkElement, verticalDirectionOfWrap);
    let verticalSideToCompare = verticalDirectionOfWrap === 'up' ? 'top' : 'bottom';
    let horizontalSideToCompare = horizontalDirectionOfWrap;
    let isInCorrectVerticalDirection = verticalDirectionOfWrap === 'up' ? isHigher : isLower;
    let isInBetterVerticalDirection = verticalDirectionOfWrap === 'up' ? isLower : isHigher;
    let isHorizontalExtreme = horizontalDirectionOfWrap === 'left' ? isLeftward : isRightward;
    let closerToCorrectHorizontalEdge = horizontalDirectionOfExtremeWrap === 'right' ? rightMostRect : leftMostRect;

    candidateRectContainers = rectContainers.filter(rectObject => isInCorrectVerticalDirection(rectObject, currentSelectionRect));
    candidateRectContainers = candidateRectContainers.filter(rectObject => !isVerticallyOverlapping(rectObject, currentSelectionRect)); // if left and right accept overlap wrap must not
    candidateRectContainers = candidateRectContainers.filter(rectObject => rectObject.element !== currentLinkElement);

    if (candidateRectContainers.length > 0) {
      let leftmostDownwardRect = candidateRectContainers // Name reflects LTR text
        .reduce((leftmostDownwardRect, newRect) => {
          if (isInBetterVerticalDirection(leftmostDownwardRect, newRect) && !isVerticallyOverlapping(leftmostDownwardRect, newRect)) return leftmostDownwardRect;
          if (isInBetterVerticalDirection(newRect, leftmostDownwardRect) && !isVerticallyOverlapping(newRect, leftmostDownwardRect)) return newRect;
          return closerToCorrectHorizontalEdge(leftmostDownwardRect, newRect);
        });

      if (leftmostDownwardRect) {
        return scrollOrSelect(leftmostDownwardRect);
      }
    }

    // Wrap to leftmost top (or rightmost bottom for RTL)
    let verticalDirectionOfExtremeWrap = verticalDirectionToWrapAfterFinalRightmostLink(currentLinkElement);
    let horizontalDirectionOfExtremeWrap = horizontalDirectionToWrapAfterExtremeLink(currentLinkElement, verticalDirectionOfExtremeWrap);
    let extremeHorizontalPosition = horizontalDirectionOfExtremeWrap === 'left' ? 0 : window.innerWidth;
    let verticalSideToCompareExtremeWrap = verticalDirectionOfExtremeWrap === 'up' ? 'top' : 'bottom';
    let horizontalSideToCompareExtremeWrap = horizontalDirectionOfExtremeWrap;
    let isVerticallyFarther = verticalDirectionOfExtremeWrap === 'up' ? isHigher : isLower;
    let closerToCorrectHorizontalExtremeEdge = horizontalDirectionOfExtremeWrap === 'right' ? rightMostRect : leftMostRect;

    let leftmostTopRect = rectContainers
      .reduce((leftmostTopRect, newRect) => {
        if (isVerticallyFarther(leftmostTopRect, newRect)) return leftmostTopRect;
        if (isVerticallyFarther(newRect, leftmostTopRect)) return newRect;
        if (leftmostTopRect[verticalSideToCompareExtremeWrap] === newRect[verticalSideToCompareExtremeWrap]) {
          return closerToCorrectHorizontalExtremeEdge(leftmostTopRect, newRect);
        }
      });

    if (leftmostTopRect) {
      return scrollOrSelect(leftmostTopRect);
    }
  }
}

function isHigher(rect1, rect2) {
  if (rect1.bottom < rect2.bottom) return true;
  return false;
}

function isLower(rect1, rect2) {
  if (rect1.top > rect2.top) return true;
  return false;
}

function bottomsAreEven(rect1, rect2) {
  if (rect1.bottom === rect2.bottom) return true;
  return false;
}

function topsAreEven(rect1, rect2) {
  if (rect1.top === rect2.top) return true;
  return false;
}

function isHorizontallyEvenWith(rect1, rect2) {
  if (Math.abs(rect1.top - rect2.top) < 30) return true;
  return false;
}

function isRightward(rect1, rect2) {
  if (rect1.left > rect2.left) return true;
  return false;
}

function isLeftward(rect1, rect2) {
  if (rect1.right < rect2.right) return true;
  return false;
}

function rightMostRect(rect1, rect2) {
  return rect1.right > rect2.right ? rect1 : rect2;
}

function leftMostRect(rect1, rect2) {
  return rect1.left < rect2.left ? rect1 : rect2;
}

function topMostRect(rect1, rect2) {
  return rect1.top < rect2.top ? rect1 : rect2;
}

function bottomMostRect(rect1, rect2) {
  return rect1.bottom > rect2.bottom ? rect1 : rect2;
}

function isHorizontallyWithin(rect1, rect2) {
  if (rect1.left > rect2.left && rect1.right < rect2.right) return true;
  return false;
}

function isHorizontallyOverlapping(rect1, rect2) {
  return (rect1.left < rect2.right && rect2.left < rect1.right);
}

function isVerticallyOverlapping(rect1, rect2) {
  return (
    (rect1.top < rect2.bottom && rect1.bottom > rect2.top) ||
    (rect2.top < rect1.bottom && rect2.bottom > rect1.top)
  );
}

function isInViewportVertically(rectObject) {
  const viewportHeight = ScrollableContainer.visibleHeight;

  // Check if the top or the bottom of the rectangle is within the viewport
  return (
    (rectObject.top >= 0 && rectObject.top <= viewportHeight) ||
    (rectObject.bottom >= 0 && rectObject.bottom <= viewportHeight)
  );
}

function horizontallyCloserRect(rect1, rect2, targetRect) {
  const midpointRect1 = (rect1.left + rect1.right) / 2;
  const midpointRect2 = (rect2.left + rect2.right) / 2;
  const midpointTarget = (targetRect.left + targetRect.right) / 2;

  const distanceToRect1 = Math.abs(midpointRect1 - midpointTarget);
  const distanceToRect2 = Math.abs(midpointRect2 - midpointTarget);

  if (distanceToRect1 < distanceToRect2) {
    return rect1;
  } else {
    return rect2;
  }
}

function isVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && style.opacity !== '0%';
}

function scrollOrSelect(rect, options) {
  const amountOfLinkThatMustBeVisibleToSelect = -10; // we even let links be a bit over the viewport

  if (rect.top - ScrollableContainer.top > window.innerHeight - amountOfLinkThatMustBeVisibleToSelect) {
    return scrollElementToPosition(rect.element, {targetRatio: 0.2, maxScrollRatio: 0.5, minDiff: 50, direction: 'down', behavior: 'smooth'});
  } else if (rect.bottom - ScrollableContainer.top < amountOfLinkThatMustBeVisibleToSelect) {
    return scrollElementToPosition(rect.element, {targetRatio: 0.25, maxScrollRatio: 0.5, minDiff: 50, direction: 'up', behavior: 'smooth'});
  } else {
    const link = new Link(rect.element);
    return link.select(options);
  }
}

function greaterHorizontalOverlap(selectedRect, candidateRect1, candidateRect2) {
  function calculateHorizontalOverlap(rect1, rect2) {
    return Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
  }

  const overlap1 = calculateHorizontalOverlap(selectedRect, candidateRect1);
  const overlap2 = calculateHorizontalOverlap(selectedRect, candidateRect2);

  if (overlap1 > overlap2) {
    return candidateRect1;
  } else {
    return candidateRect2;
  }
}

function distanceComparingSide(rect1, rect2, side) {
  if (typeof rect1 === 'number') rect1 = { [side]: rect1 };
  if (typeof rect2 === 'number') rect2 = { [side]: rect2 };

  switch (side) {
    case 'left':
      return Math.abs(rect1.left - rect2.left);
    case 'right':
      return Math.abs(rect1.right - rect2.right);
    case 'top':
      return Math.abs(rect1.top - rect2.top);
    case 'bottom':
      return Math.abs(rect1.bottom - rect2.bottom);
    case 'middle':
      return Math.abs(((rect1.left - rect1.right)/2) - ((rect2.left - rect2.right)/2));
    default:
      // Invalid side
      return null;
  }
}

function getRectsOfElements(elementArray, currentLinkElement) {
  const result = [];

  for (const element of elementArray) {
    let elementForRect = element;
    if (element.parentNode.tagName === 'TD' && element.parentNode.childNodes.length === 1) elementForRect = element.parentNode; // a link in TD should use the TD's borders

    const subRects = Array.from(elementForRect.getClientRects());
    let singleRect = { element, text: element.innerText, ...JSON.parse(JSON.stringify(elementForRect.getBoundingClientRect()))};

    if (commonAncestorIsContainer(element, currentLinkElement)) { // a link in a DIV is one rect unlike links in wrapping text
      result.push(singleRect);
    } else {
      for (let i = 0; i < subRects.length; i++) { // treat multiple rects of same link as separate candidates
        const rect = subRects[i];
        result.push({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          element: element,
          text: element.innerText
        });
      }
    }
  }

  return result;
}

function commonAncestorIsContainer(element, currentLinkElement) {
  let ancestor1 = element;
  let ancestor2 = currentLinkElement;

  while (ancestor1 !== null) {
    let tempAncestor2 = ancestor2;
    while (tempAncestor2 !== null) {
      if (ancestor1 === tempAncestor2) {
        return ['TABLE', 'TR'].includes(ancestor1.tagName) || // these containers imply links are not in free-form wrapped text
          ancestor1.classList.contains('canopy-table-list') ||
          ancestor1.classList.contains('canopy-table-row');
      }
      tempAncestor2 = tempAncestor2.parentElement;
    }
    ancestor1 = ancestor1.parentElement;
  }
  return false;
}

function getBoundingRectInDirection(element, direction) {
  let singleRect = JSON.parse(JSON.stringify(element.getBoundingClientRect()));
  let multipleRects = mergeRectsWithSameTop(getTextNodesRects(element));

  if (multipleRects.length === 1 || linkTextIsOneUnit(element)) return { element, ...singleRect};
  if (multipleRects.length === 0) return null;

  switch(direction) {
    case 'left':
      return { element, ...multipleRects.reduce((leftmostRect, currentRect) => {
        return currentRect.right > leftmostRect.right ? leftmostRect : currentRect;
      })};
    case 'right':
      return { element, ...multipleRects.reduce((rightmostRect, currentRect) => {
        return currentRect.left < rightmostRect.left ?  rightmostRect : currentRect;
      })};
    case 'up':
      return { element, ...multipleRects.reduce((uppermostRect, currentRect) => {
        return currentRect.bottom < uppermostRect.bottom ? currentRect : uppermostRect;
      })};
    case 'down':
      return { element, ...multipleRects.reduce((lowestRect, currentRect) => {
        return currentRect.top > lowestRect.top ? currentRect : lowestRect;
      })};
    default:
      throw new Error("Invalid direction argument");
  }

  function linkTextIsOneUnit(linkElement) { // is wrapped text new unit for proximity calculations or is container one unit?
    return linkElement.closest('p.canopy-paragraph > div') || linkElement.closest('p.canopy-paragraph > table'); // descendants of a div are not inline, unlike direct children of <p> or eg <b>
  }
}

function getTextNodesRects(element) {
  const textNodesRects = [];

  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = range.getClientRects();
      for (let i = 0; i < rects.length; i++) {
        textNodesRects.push(rects[i]);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (const childNode of node.childNodes) {
        traverse(childNode);
      }
    }
  }

  traverse(element);
  return textNodesRects.map(rect => JSON.parse(JSON.stringify(rect)));
}

function mergeRectsWithSameTop(rectangles) {
  const mergedRectangles = [];

  // Sort the rectangles by their top value
  rectangles.sort((rect1, rect2) => rect1.top - rect2.top);

  let currentRect = rectangles[0];

  for (let i = 1; i < rectangles.length; i++) {
    const nextRect = rectangles[i];

    // Check if the top values are the same
    if (currentRect.top === nextRect.top) {
      // Merge the rectangles horizontally
      currentRect.left = Math.min(currentRect.left, nextRect.left);
      currentRect.right = Math.max(currentRect.right, nextRect.right);
    } else {
      // Add the current merged rectangle to the result
      mergedRectangles.push(currentRect);

      // Set the current rectangle to the next one
      currentRect = nextRect;
    }
  }

  // Add the last merged rectangle to the result
  mergedRectangles.push(currentRect);

  return mergedRectangles;
}

// ** Direction wrap handling **

// When the user presses right or left, whether we wrap up or down depends on the current text direction,
// but if we wrap down, whether to pick the right-most link or the left-most link of the lower links
// depends on the text orientation of their container, not the current container, so this function
// finds the next link vertically and determines its text orientation in order to decide which side to pick from.

function verticalDirectionToWrapAfterRightmostLink(linkElement) {
  return getTextDirectionOfRootAncestor(linkElement) === 'ltr' ? 'down' : 'up';
}

function verticalDirectionToWrapAfterLeftmostLink(linkElement) {
  return getTextDirectionOfRootAncestor(linkElement) === 'ltr' ? 'up' : 'down';
}

function verticalDirectionToWrapAfterFinalRightmostLink(linkElement) {
  return getTextDirectionOfRootAncestor(linkElement) === 'ltr' ? 'up' : 'down';
}

function verticalDirectionToWrapAfterFinalLeftmostLink(linkElement) {
  return getTextDirectionOfRootAncestor(linkElement) === 'ltr' ? 'down' : 'up';
}

// Unlike the vertical direction of the wrap, the horiztonal direction of the wrap is dependent of the text direction
// of the _next_ link that will get selected, not the current one, and so is not necessarily the opposite horizontal direction of wrap
function horizontalDirectionToWrapAfterLink(linkElement, verticalDirectionOfWrap) {
  if (verticalDirectionOfWrap === 'up') {
    return getTextDirectionOfRootAncestor(getPreviousLinkOfParagraph(linkElement)) === 'ltr' ? 'right' : 'left';
  } else if (verticalDirectionOfWrap === 'down') {
    return getTextDirectionOfRootAncestor(getNextLinkOfParagraph(linkElement)) === 'ltr' ? 'left' : 'right';
  }
}

// This is when in LTR text we go 'right' on the bottom right link or 'left' on the top-left link and cycle on x and y
function horizontalDirectionToWrapAfterExtremeLink(linkElement, verticalDirectionOfWrap) {
  if (verticalDirectionOfWrap === 'up') {
    return getTextDirectionOfRootAncestor(getPreviousLinkOfParagraph(linkElement)) === 'ltr' ? 'left' : 'right';
  } else if (verticalDirectionOfWrap === 'down') {
    return getTextDirectionOfRootAncestor(getNextLinkOfParagraph(linkElement)) === 'ltr' ? 'right' : 'left';
  }
}

function getNextLinkOfParagraph(linkElement) {
  let paragraphElement = linkElement.closest('p.canopy-paragraph');
  let allLinks = Array.from(paragraphElement.querySelectorAll('.canopy-selectable-link'));
  let currentLinkIndex = allLinks.indexOf(Link.selection.element);

  if (currentLinkIndex < allLinks.length - 1) {
    return allLinks[currentLinkIndex + 1];
  } else {
    return Link.selection.element;
  }
}

function getPreviousLinkOfParagraph(linkElement) {
  let paragraphElement = linkElement.closest('p.canopy-paragraph');
  let allLinks = Array.from(paragraphElement.querySelectorAll('.canopy-selectable-link'));
  let currentLinkIndex = allLinks.indexOf(Link.selection);

  if (currentLinkIndex > 0) {
    return allLinks[currentLinkIndex - 1];
  } else {
    return Link.selection.element;
  }
}

function getTextDirectionOfRootAncestor(element) { // allow manual override of rtl eg for english names of semetic works
  return element.dir === 'rtl' ? 'rtl' : detectTextDirection(getHighestAncestor(element).innerText);
}

function getHighestAncestor(element) { // find the ancestor element that is a direct child of the paragraph element
  while(element.parentNode !== Link.selection.element.closest('p.canopy-paragraph')) {
    element = element.parentNode;
  }
  return element;
}

function detectTextDirection(text) {
  // Regular expression patterns for different character ranges
  const rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC';
  const ltrChars = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
                   '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF';
  const rtlDirCheck = new RegExp(`^[^${ltrChars}]*[${rtlChars}]`);

  // Check if the text is RTL
  return rtlDirCheck.test(text) ? 'rtl' : 'ltr';
}


export {
  moveInDirection
}
