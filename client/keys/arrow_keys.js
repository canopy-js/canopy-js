import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';

function moveInDirection(direction) {
  const currentLinkElement = Link.selection.element;
  if (!currentLinkElement) return null;

  if (direction === 'up') {
    let candidateLinks = Array.from(document.querySelectorAll('.canopy-selectable-link'));
    let currentSelectionHigherRect = getDirectionBoundingRect(currentLinkElement, 'up');
    let currentSelectionLowerRect = getDirectionBoundingRect(currentLinkElement, 'down');
    let rectContainers = getRectsOfElements(candidateLinks);

    let candidateRectContainers = rectContainers
      .filter(rectObject => isHigher(rectObject, currentSelectionLowerRect))
      .filter(rect => rect.element !== currentLinkElement);

    if (candidateRectContainers.length === 0) return null;

    let lowestHigherRect = candidateRectContainers
      .reduce((lowestHigherRect, newRect) => {
        console.error(lowestHigherRect.element.innerText, newRect.element.innerText)
        if (Link.selection.parentLink?.element === lowestHigherRect.element) { // lowestHigherRect is the parent link
          if (newRect.element.closest('p.canopy-paragraph') === lowestHigherRect.element.closest('p.canopy-paragraph')) { // newRect is in p of parent
            return lowestHigherRect; // prefer parent over closer sibling
          }
        }

        if (Link.selection.parentLink?.element === newRect.element) { // newRect is the parent link
          if (newRect.element.closest('p.canopy-paragraph') === newRect.element.closest('p.canopy-paragraph')) { // newRect is in p of parent
            return newRect; // prefer parent over closer sibling
          }
        }


        if (isLower(lowestHigherRect, newRect)) return lowestHigherRect;

        if (isLower(newRect, lowestHigherRect)) return newRect;

        if (lowestHigherRect.bottom === newRect.bottom) {
          if (isHorizontallyWithin(currentSelectionHigherRect, lowestHigherRect)) return lowestHigherRect;
          if (isHorizontallyWithin(currentSelectionHigherRect, newRect)) return newRect;
          if (isHorizontallyWithin(lowestHigherRect, currentSelectionHigherRect) && !isHorizontallyWithin(newRect, currentSelectionHigherRect)) return lowestHigherRect;
          if (isHorizontallyWithin(newRect, currentSelectionHigherRect) && !isHorizontallyWithin(lowestHigherRect, currentSelectionHigherRect)) return newRect;
          if (isHorizontallyOverlapping(lowestHigherRect, currentSelectionHigherRect) && !isHorizontallyOverlapping(newRect, currentSelectionHigherRect)) return lowestHigherRect;
          if (isHorizontallyOverlapping(newRect, currentSelectionHigherRect) && !isHorizontallyOverlapping(lowestHigherRect, currentSelectionHigherRect)) return newRect;
          if (lowestHigherRect.element.closest('p.canopy-paragraph') === Link.selection.parentLink.enclosingParagraph.paragraphElement) { // going up to new paragraph
            let xDistanceFromCurrentToBest = distanceComparingSide(currentSelectionHigherRect, lowestHigherRect, 'right');
            let xDistanceFromCurrentToNew = distanceComparingSide(currentSelectionHigherRect, newRect, 'right');
            return xDistanceFromCurrentToBest > xDistanceFromCurrentToNew ? newRect : lowestHigherRect;
          } else { // going up in same paragraph
            let xDistanceFromCurrentToBest = distanceComparingSide(currentSelectionLowerRect, lowestHigherRect, 'right');
            let xDistanceFromCurrentToNew = distanceComparingSide(currentSelectionLowerRect, newRect, 'right');
            return xDistanceFromCurrentToBest > xDistanceFromCurrentToNew ? newRect : lowestHigherRect;
          }
        }
      });

    if (!lowestHigherRect) { // no upwards link available, do nothing
      return null;
    }

    const amountOfLinkThatMustBeVisibleToSelect = 15;
    if (lowestHigherRect.bottom < amountOfLinkThatMustBeVisibleToSelect) {
      console.error('scrolling')
      return scrollUp();
    }

    const link = new Link(lowestHigherRect.element);

    console.error('Selecting link: ' + lowestHigherRect.element.innerText)

    if (!link && Link.selection.enclosingParagraph.equals(Paragraph.pageRoot)) {
      return updateView(link.enclosingParagraph.path); // deselect link
    }

    return updateView(link.path, link);

  } else if (direction === 'down') {
    let candidateLinks = Array.from(document.querySelectorAll('.canopy-selectable-link'));
    let currentSelectionHigherRect = getDirectionBoundingRect(currentLinkElement, 'up');
    let currentSelectionLowerRect = getDirectionBoundingRect(currentLinkElement, 'down');
    let rectContainers = getRectsOfElements(candidateLinks);

    let candidateRectContainers = rectContainers
      .filter(rectObject => rectObject.top > currentSelectionHigherRect.top)
      .filter(rect => rect.element !== currentLinkElement);

    let highestLowerRect;
    if (candidateRectContainers.length > 0) {
      highestLowerRect = candidateRectContainers
        .reduce((highestLowerRect, newRect) => {
          if (isHigher(highestLowerRect, newRect)) return highestLowerRect;
          if (isHigher(newRect, highestLowerRect)) return newRect;
          if (highestLowerRect.top === newRect.top) {
            if (isHorizontallyWithin(currentSelectionHigherRect, highestLowerRect)) return highestLowerRect;
            if (isHorizontallyWithin(currentSelectionHigherRect, newRect)) return newRect;
            if (isHorizontallyWithin(highestLowerRect, currentSelectionHigherRect) && !isHorizontallyWithin(newRect, currentSelectionHigherRect)) return highestLowerRect;
            if (isHorizontallyWithin(newRect, currentSelectionHigherRect) && !isHorizontallyWithin(highestLowerRect, currentSelectionHigherRect)) return newRect;
            if (highestLowerRect.element.closest('p.canopy-paragraph') === Link.selection.targetParagraph.paragraphElement) { // going down into new paragraph
              if (isHorizontallyOverlapping(highestLowerRect, currentSelectionLowerRect) && !isHorizontallyOverlapping(newRect, currentSelectionLowerRect)) return highestLowerRect;
              if (isHorizontallyOverlapping(newRect, currentSelectionLowerRect) && !isHorizontallyOverlapping(highestLowerRect, currentSelectionLowerRect)) return newRect;
              let xDistanceFromCurrentToBest = distanceComparingSide(currentSelectionLowerRect, highestLowerRect, 'right');
              let xDistanceFromCurrentToNew = distanceComparingSide(currentSelectionLowerRect, newRect, 'right');
              return xDistanceFromCurrentToBest > xDistanceFromCurrentToNew ? newRect : highestLowerRect;
            } else { // going down in same paragraph
              if (isHorizontallyOverlapping(highestLowerRect, currentSelectionHigherRect) && !isHorizontallyOverlapping(newRect, currentSelectionHigherRect)) return highestLowerRect;
              if (isHorizontallyOverlapping(newRect, currentSelectionHigherRect) && !isHorizontallyOverlapping(highestLowerRect, currentSelectionHigherRect)) return newRect;
              let xDistanceFromCurrentToBest = distanceComparingSide(currentSelectionHigherRect, highestLowerRect, 'right');
              let xDistanceFromCurrentToNew = distanceComparingSide(currentSelectionHigherRect, newRect, 'right');
              return xDistanceFromCurrentToBest > xDistanceFromCurrentToNew ? newRect : highestLowerRect;
            }
          }
        });
      }

    if (highestLowerRect) {
      const amountOfLinkThatMustBeVisibleToSelect = 15;
      if (highestLowerRect.top > window.innerHeight - amountOfLinkThatMustBeVisibleToSelect) {
        return scrollDown(highestLowerRect);
      }

      let link = new Link(highestLowerRect.element); // if visually 'down' link is in new paragraph that has previous selection, use previous selection
      if (!Link.selection.enclosingParagraph.equals(link.enclosingParagraph) && Link.lastSelectionOfParagraph(link.enclosingParagraph)) {
        link = Link.lastSelectionOfParagraph(link.enclosingParagraph);
      }
      return updateView(link.path, link);
    } else {
      let sectionElementRect = Paragraph.current.sectionElement.getBoundingClientRect();

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
  } else if (direction === 'left') {
    let candidateLinks = Link.selection.element.closest('p.canopy-paragraph')
      .querySelectorAll('.canopy-selectable-link');
    let currentSelectionRect = getDirectionBoundingRect(currentLinkElement, 'right');
    let rectContainers = getRectsOfElements(candidateLinks);

    let candidateRectContainers = rectContainers.filter(rectObject => rectObject.right < currentSelectionRect.right);
    candidateRectContainers = candidateRectContainers.filter(rectObject => rectObject.bottom === currentSelectionRect.bottom); // first try to find direct left
    candidateRectContainers = candidateRectContainers.filter(rectObject => rectObject.element !== currentLinkElement);

    if (candidateRectContainers.length > 0) {
      let rightmostLeftRect = candidateRectContainers
        .reduce((rightmostLeftRect, newRect) => {
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
    let isVerticallyCloser = verticalDirectionOfWrap === 'up' ? isLower : isHigher;
    let isInCorrectVerticalDirection = verticalDirectionOfWrap === 'up' ? isHigher : isLower;
    let isHorizontalExtreme = horizontalDirectionOfWrap === 'left' ? isLeftward : isRightward;

    candidateRectContainers = rectContainers.filter(rectObject => isInCorrectVerticalDirection(rectObject, currentSelectionRect));
    candidateRectContainers = candidateRectContainers.filter(rectObject => rectObject.element !== currentLinkElement);

    if (candidateRectContainers.length > 0) {
      let rightmostUpwardRect = candidateRectContainers // name reflects LTR text
        .reduce((rightmostUpwardRect, newRect) => {
          if (isVerticallyCloser(rightmostUpwardRect, newRect)) return rightmostUpwardRect;
          if (isVerticallyCloser(newRect, rightmostUpwardRect)) return newRect;
          if (rightmostUpwardRect[verticalSideToCompare] === newRect[verticalSideToCompare]) {
            if(isHorizontalExtreme(rightmostUpwardRect, newRect)) return rightmostUpwardRect;
            if(isHorizontalExtreme(newRect, rightmostUpwardRect)) return newRect;
            return yDistanceFromCurrentToBest > yDistanceFromCurrentToNew ? newRect : rightmostUpwardRect;
          }
        });

      if (rightmostUpwardRect) {
        return scrollOrSelect(rightmostUpwardRect);
      }
    }

    // Wrap to rightmost bottom (or leftmost top for RTL)
    let verticalDirectionOfExtremeWrap = verticalDirectionToWrapAfterFinalLeftmostLink(currentLinkElement);
    let horizontalDirectionOfExtremeWrap = horizontalDirectionToWrapAfterExtremeLink(currentLinkElement, verticalDirectionOfExtremeWrap);
    let extremeHorizontalPosition = horizontalDirectionOfExtremeWrap === 'left' ? 0 : window.innerWidth;
    let verticalSideToCompareExtremeWrap = verticalDirectionOfExtremeWrap === 'down' ? 'bottom' : 'top';
    let horizontalSideToCompareExtremeWrap = horizontalDirectionOfExtremeWrap;
    let isVerticallyFarther = verticalDirectionOfExtremeWrap === 'up' ? isHigher : isLower;

    let rightBottomMostRect = rectContainers // Name reflects LTR text
      .reduce((rightBottomMostRect, newRect) => {
        if (isVerticallyFarther(rightBottomMostRect, newRect)) return rightBottomMostRect;
        if (isVerticallyFarther(newRect, rightBottomMostRect)) return newRect;
        if (rightBottomMostRect[verticalSideToCompareExtremeWrap] === newRect[verticalSideToCompareExtremeWrap]) {
          let yDistanceFromCurrentToBest = distanceComparingSide(extremeHorizontalPosition, rightBottomMostRect, horizontalSideToCompareExtremeWrap); // generally 'right'
          let yDistanceFromCurrentToNew = distanceComparingSide(extremeHorizontalPosition, newRect, horizontalSideToCompareExtremeWrap);
          return yDistanceFromCurrentToBest > yDistanceFromCurrentToNew ? newRect : rightBottomMostRect; // pick closest to new edge
        }
      });

    if (rightBottomMostRect) {
      return scrollOrSelect(rightBottomMostRect);
    }

  } else if (direction === 'right') {
    let candidateLinks = Link.selection.element.closest('p.canopy-paragraph').querySelectorAll('.canopy-selectable-link');
    let currentSelectionRect = getDirectionBoundingRect(currentLinkElement, 'left');
    let rectContainers = getRectsOfElements(candidateLinks);

    let candidateRectContainers = rectContainers.filter(rectObject => rectObject.left > currentSelectionRect.left);
    candidateRectContainers = candidateRectContainers.filter(rectObject => rectObject.bottom === currentSelectionRect.bottom); // try to find direct right
    candidateRectContainers = candidateRectContainers.filter(rectObject => rectObject.element !== currentLinkElement);

    if (candidateRectContainers.length > 0) {
      let leftmostRightRect = candidateRectContainers
        .reduce((leftmostRightRect, newRect) => {
          if (leftmostRightRect.left < newRect.left) return leftmostRightRect;
          if (leftmostRightRect.left > newRect.left) return newRect;
          if (leftmostRightRect.left === newRect.left) {
            let yDistanceFromCurrentToBest = distanceComparingSide(currentSelectionRect, leftmostRightRect, 'top');
            let yDistanceFromCurrentToNew = distanceComparingSide(currentSelectionRect, newRect, 'top');
            return yDistanceFromCurrentToBest > yDistanceFromCurrentToNew ? newRect : leftmostRightRect; // return closest of the rightward
          }
        });

      if (leftmostRightRect) {
        return scrollOrSelect(leftmostRightRect);
      }
    }

    // Wrap to downward far-left (or upward far-right for RTL text)
    let verticalDirectionOfWrap = verticalDirectionToWrapAfterRightmostLink(currentLinkElement);
    let horizontalDirectionOfWrap = horizontalDirectionToWrapAfterLink(currentLinkElement, verticalDirectionOfWrap);
    let verticalSideToCompare = verticalDirectionOfWrap === 'up' ? 'bottom' : 'top';
    let horizontalSideToCompare = horizontalDirectionOfWrap;
    let isVerticallyCloser = verticalDirectionOfWrap === 'up' ? isLower : isHigher;
    let isInCorrectVerticalDirection = verticalDirectionOfWrap === 'up' ? isHigher : isLower;
    let isHorizontalExtreme = horizontalDirectionOfWrap === 'left' ? isLeftward : isRightward;

    candidateRectContainers = rectContainers.filter(rectObject => isInCorrectVerticalDirection(rectObject, currentSelectionRect));
    candidateRectContainers = candidateRectContainers.filter(rectObject => rectObject.element !== currentLinkElement);
    if (candidateRectContainers.length > 0) {
      let leftmostDownwardRect = candidateRectContainers // Name reflects LTR text
        .reduce((leftmostDownwardRect, newRect) => {
          if (isVerticallyCloser(leftmostDownwardRect, newRect)) return leftmostDownwardRect;
          if (isVerticallyCloser(newRect, leftmostDownwardRect)) return newRect;
          if (leftmostDownwardRect[verticalSideToCompare] === newRect[verticalSideToCompare]) {
            if(isHorizontalExtreme(leftmostDownwardRect, newRect)) return leftmostDownwardRect;
            if(isHorizontalExtreme(newRect, leftmostDownwardRect)) return newRect;
          }
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

    let leftmostTopRect = rectContainers
      .reduce((leftmostTopRect, newRect) => {
        if (isVerticallyFarther(leftmostTopRect, newRect)) return leftmostTopRect;
        if (isVerticallyFarther(newRect, leftmostTopRect)) return newRect;
        if (leftmostTopRect[verticalSideToCompareExtremeWrap] === newRect[verticalSideToCompareExtremeWrap]) {
          let yDistanceFromCurrentToBest = distanceComparingSide(extremeHorizontalPosition, leftmostTopRect, horizontalDirectionOfExtremeWrap); // generally 'left'
          let yDistanceFromCurrentToNew = distanceComparingSide(extremeHorizontalPosition, newRect, horizontalDirectionOfExtremeWrap);
          return yDistanceFromCurrentToBest > yDistanceFromCurrentToNew ? newRect : leftmostTopRect; // closest to new edge
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
  console.error('rect1 top: ' + rect1.top, 'rect1 text: ' + rect1.element.innerText, 'rect2 top: ', rect2.top, 'rect2 text: ' + rect2.element.innerText)
  if (rect1.top > rect2.top) return true;
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

function isHorizontallyWithin(rect1, rect2) {
  if (rect1.left > rect2.left && rect1.right < rect2.right) return true;
  return false;
}

function isHorizontallyOverlapping(rect1, rect2) {
  if (rect1.left < rect2.left && rect2.left < rect1.right && rect2.right > rect1.right) return true;
  if (rect2.left < rect1.left && rect1.left < rect2.right && rect1.right > rect2.right) return true;
  return false;
}

function scrollDown(arg) {
  let rect;

  // Check if the argument is a rect or an element
  if (arg.top) {
    rect = arg;
  } else if (arg instanceof Element) {
    rect = arg.getBoundingClientRect();
  } else {
    throw new Error("Invalid argument: Must be a DOMRect or an Element.");
  }

  const viewportHeight = window.innerHeight;
  const scrollAmountTo90Percent = rect ? rect.top - (0.9 * viewportHeight) : Infinity;
  const halfViewportHeight = 0.4 * viewportHeight;
  const scrollAmount = Math.min(scrollAmountTo90Percent, halfViewportHeight);

  return window.scrollBy({
    top: scrollAmount,
    behavior: 'smooth'
  });
}

function scrollUp(rect) {
  const viewportHeight = window.innerHeight;
  const scrollAmountTo90Percent = rect ? (0.9 * viewportHeight) - rect.bottom : Infinity;
  const halfViewportHeight = 0.4 * viewportHeight;
  const scrollAmount = Math.min(scrollAmountTo90Percent, halfViewportHeight);

  // If the parentLink is not visible or is in the top 10% of the page, scroll smoothly
  return window.scrollBy({
    top: -scrollAmount,  // Negative since we're scrolling upwards
    behavior: 'smooth'
  });
}

function scrollOrSelect(rect) {
  const amountOfLinkThatMustBeVisibleToSelect = 15;
  if (rect.top > window.innerHeight - amountOfLinkThatMustBeVisibleToSelect) {
    return scrollDown(rect);
  } else if (rect.bottom < amountOfLinkThatMustBeVisibleToSelect) {
    return scrollUp(rect);
  } else {
    const link = new Link(rect.element);
    return updateView(link.path, link);
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

function getRectsOfElements(elementArray) {
  const result = [];

  for (const element of elementArray) {
    const rects = element.getClientRects();
    for (let i = 0; i < rects.length; i++) { // treat multiple rects of same link as separate candidates
      const rect = rects[i];
      result.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        element: element
      });
    }
  }

  return result;
}

function getDirectionBoundingRect(element, direction) {
  let singleRect = JSON.parse(JSON.stringify(element.getBoundingClientRect()));
  let textNode = element;
  while (textNode.firstChild) textNode = textNode.firstChild;

  const range = document.createRange();
  range.selectNodeContents(textNode);
  const rects = Array.from(range.getClientRects()).map(rect => JSON.parse(JSON.stringify(rect)));

  if (rects.length === 1 || linkTextIsOneUnit(element)) return { element, ...singleRect};
  if (rects.length === 0) return null;

  switch(direction) {
    case 'left':
      return { element, ...rects.reduce((leftmostRect, currentRect) => {
        return currentRect.right > leftmostRect.right ? leftmostRect : currentRect;
      })};
    case 'right':
      return { element, ...rects.reduce((rightmostRect, currentRect) => {
        return currentRect.left < rightmostRect.left ?  rightmostRect : currentRect;
      })};
    case 'up':
      return { element, ...rects.reduce((uppermostRect, currentRect) => {
        return currentRect.bottom < uppermostRect.bottom ? currentRect : uppermostRect;
      })};
    case 'down':
      return { element, ...rects.reduce((lowestRect, currentRect) => {
        return currentRect.top > lowestRect.top ? currentRect : lowestRect;
      })};
    default:
      throw new Error("Invalid direction argument");
  }

  function linkTextIsOneUnit(linkElement) { // is wrapped text new unit for proximity calculations or is container one unit?
    return linkElement.closest('p.canopy-paragraph > div'); // descendants of a div are not inline, unlike direct children of <p> or eg <b>
  }
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
