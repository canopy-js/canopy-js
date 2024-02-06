import { canopyContainer } from 'helpers/getters';
import ScrollableContainer from 'helpers/scrollable_container';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import Paragraph from 'models/paragraph';
import updateView from 'display/update_view';
import renderTokenElement from 'render/render_token_element';
import fetchAndRenderPath from 'render/fetch_and_render_path';

function setHeader(topic, displayOptions) {
  let headerDomElement = document.querySelector(`h1[data-topic-name="${topic.cssMixedCase}"]`);
  headerDomElement.style.display = 'block';
  headerDomElement.style.opacity = '0%';
  if (displayOptions.scrollStyle !== 'instant') {
    headerDomElement.style.opacity = '100%'; // the page is scrolled to the right position so there wont be a jump
  }
  return { show: () => { headerDomElement.style.opacity = '100%' } };
}

function hideAllSectionElements() {
  Array.from(document.getElementsByTagName("section")).forEach((sectionElement) => {
    sectionElement.style.display = 'none';
  });
}

function closeAllLinks() { // now selection class management is done in Link.updateSelectionClass
  Array.from(document.getElementsByTagName("a")).forEach((linkElement) => {
    linkElement.classList.remove('canopy-open-link'); // now
  });
}

function deselectSectionElement() {
  Array.from(document.querySelectorAll('.canopy-selected-section')).forEach((sectionElement) => {
    sectionElement.classList.remove('canopy-selected-section');
  });
}

function removeScrollCompleteClass() {
  Array.from(document.querySelectorAll('.canopy-scroll-complete')).forEach((sectionElement) => {
    sectionElement.classList.remove('canopy-scroll-complete');
  });
}

function hideHeaders() {
  Array.from(document.querySelectorAll('#_canopy h1')).forEach(header => {
    header.style.display = 'none';
  });
}

function tryPathPrefix(path, displayOptions) {
  console.error("No section element found for path: ", path.string);
  if (path.length > 1) {
    console.log("Trying: ", path.withoutLastSegment.string);
    return displayPath(path.withoutLastSegment, null, {scrollStyle: 'instant'});
  } else if(!displayOptions.defaultRedirect) {
    console.error("No path prefixes remain to try. Redirecting to default topic: " + Path.default);
    return updateView(Path.default, null, { defaultRedirect: true, scrollStyle: 'instant' });
  } else {
    throw new Error('Redirect to default topic failed terminally.')
  }
}

const resetDom = () => {
  hideHeaders();
  closeAllLinks();
  hideAllSectionElements();
  deselectSectionElement();
  removeScrollCompleteClass();
}

function scrollPage(link, options) {
  options = options || {};
  let behavior = options.scrollStyle || 'smooth';
  let { scrollToParagraph, direction } = options;
  canopyContainer.dataset.imageLoadScrollBehavior = behavior; // if images later load, follow the most recent scroll behavior
  canopyContainer.dataset.initialLoad = options.initialLoad;

  if (!link) return scrollElementToPosition(Paragraph.root.paragraphElement, {targetRatio: 0.5, maxScrollRatio: Infinity, behavior, side: 'top' });
  let maxScrollRatio = behavior === 'instant' || scrollToParagraph || options.scrollDirect ? Infinity : 0.75; // no limit on initial load and click
  let minDiff = 75; //(maxScrollRatio === Infinity) ? null : 75;

  if (scrollToParagraph) {
    return scrollElementToPosition(link.childParagraph.paragraphElement,
      {targetRatio: 0.3, maxScrollRatio, minDiff, behavior, side: 'top', direction}); // up on root needs direction
  } else { // scroll to link
    const linkElement = link?.element;
    if (linkElement) {
      return scrollElementToPosition(linkElement, {targetRatio: 0.3, maxScrollRatio, minDiff, behavior, direction});
    } else { // root paragraph
      return scrollElementToPosition(Paragraph.current.sectionElement, {targetRatio: 0, maxScrollRatio, minDiff, behavior, direction});
    }
  }
}

function scrollElementToPosition(element, options) {
  if (!(element instanceof Element)) throw new Error('Argument to scrollElementToPosition must be DOM element');
  let { targetRatio, maxScrollRatio, minDiff, direction, behavior, side } = options;

  let elementRect = element.getBoundingClientRect();
  let idealTargetPositionOnVisibleContainer = ScrollableContainer.visibleHeight * targetRatio;

  let containerPointToPutAtTarget;
  if (side === 'bottom') {
    containerPointToPutAtTarget = elementRect.bottom - ScrollableContainer.top + ScrollableContainer.currentScroll;
  } else if (side === 'top') {
    containerPointToPutAtTarget = elementRect.top - ScrollableContainer.top + ScrollableContainer.currentScroll;
  } else {
    side = 'middle';
    containerPointToPutAtTarget = (elementRect.top - ScrollableContainer.top + ScrollableContainer.currentScroll) + (elementRect.height / 2);
  }

  // Handling large A tags
  if (element.tagName === 'A' && (side === 'middle' || side === 'bottom')) {
    const padding = 20; // minimum space between top of link and top of screen
    const topOffScreen = (side === 'bottom' ? 1 : .5) * (elementRect.bottom - elementRect.top) + padding > idealTargetPositionOnVisibleContainer;
    if (topOffScreen) {
      targetRatio = 0.05;
      idealTargetPositionOnVisibleContainer = ScrollableContainer.visibleHeight * targetRatio;
      containerPointToPutAtTarget = elementRect.top + ScrollableContainer.currentScroll;
    }
  }

  // if (element.tagName === 'P') { // try not to put parent link out of view
  //   let parentLinkElement = Paragraph.for(element.closest('.canopy-section')).parentLink?.element;

  //   if (parentLinkElement) {
  //     const parentLinkRect = parentLinkElement.getBoundingClientRect();
  //     const containerTargetRelativeToViewport = containerPointToPutAtTarget - ScrollableContainer.currentScroll;
  //     const parentLinkTopWithinContainer = parentLinkRect.top - ScrollableContainer.top;
  //     const distanceBetweenLinkAndParagraph = containerPointToPutAtTarget - parentLinkTopWithinContainer - ScrollableContainer.currentScroll;
  //     const linkFocusPutsParagraphInLowerHalf = distanceBetweenLinkAndParagraph > ScrollableContainer.visibleHeight / 2;

  //     // Check if the parent link goes above the top of the viewport
  //     if (idealTargetPositionOnVisibleContainer < distanceBetweenLinkAndParagraph && !linkFocusPutsParagraphInLowerHalf) { // link will be off screen
  //       targetRatio = 0.1;
  //       idealTargetPositionOnVisibleContainer = ScrollableContainer.visibleHeight * targetRatio;
  //       containerPointToPutAtTarget = parentLinkRect.top + ScrollableContainer.currentScroll; // change goal to putting link near top
  //     }
  //   }
  // }

  let idealScrollY = containerPointToPutAtTarget - idealTargetPositionOnVisibleContainer;

  // Adjust idealScrollY to the closest possible scroll position
  if (ScrollableContainer.innerHeight - ScrollableContainer.visibleHeight < idealScrollY) console.error('Scrollable area not long enough to scroll to desired position');
  idealScrollY = Math.max(0, Math.min(idealScrollY, ScrollableContainer.innerHeight - ScrollableContainer.visibleHeight));

  // Use the calculated scroll or max scroll if it is too big
  const maxScrollDistance = maxScrollRatio ? ScrollableContainer.visibleHeight * maxScrollRatio : Infinity;
  let actualScrollY;
  if (idealScrollY > ScrollableContainer.currentScroll) {
    actualScrollY = Math.min(idealScrollY, ScrollableContainer.currentScroll + maxScrollDistance);
  } else {
    actualScrollY = Math.max(idealScrollY, ScrollableContainer.currentScroll - maxScrollDistance);
  }

  let shouldScroll = idealScrollY - ScrollableContainer.currentScroll !== 0;

  // Check that the scroll is larger than the minimum we would initiate a scroll for
  if (minDiff) { // && maxScrollRatio !== Infinity) {
    const diff = Math.abs(ScrollableContainer.currentScroll - actualScrollY);
    let linkOffScreen = element.tagName === 'A' && (elementRect.top < 5 || elementRect.bottom > ScrollableContainer.visibleHeight);
    shouldScroll = !minDiff || (minDiff && (diff > minDiff)) || linkOffScreen;
  }

  // If the caller has constrained the scroll in a single direction, check we're going that way
  if (direction === 'up') {
    shouldScroll = shouldScroll && actualScrollY < ScrollableContainer.currentScroll;
  }

  if (direction === 'down') {
    shouldScroll = shouldScroll && actualScrollY > ScrollableContainer.currentScroll;
  }

  if (shouldScroll) {
    return scrollToWithPromise({ top: actualScrollY, behavior, ...options });
  } else {
    return Promise.resolve(true);
  }
}

function placeLineAt(y, color) {
  // Create a new div element to represent the line
  const line = document.createElement('div');

  // Apply CSS styles to make the div a horizontal line at position y
  line.style.position = 'absolute';
  line.style.left = '0';
  line.style.width = '100%';
  line.style.height = '2px'; // Line thickness
  line.style.backgroundColor = color; // Line color
  line.style.top = `${y}px`;

  // Append the line to the body of the document
  ScrollableContainer.element.appendChild(line);
}

let scrollInProgress = null;
function getScrollInProgress() {
  return scrollInProgress;
}

let currentScrollOptions = null; // multiple calls to scrollToWithPromise replace the desired destination

function scrollToWithPromise(options) {
  currentScrollOptions = options;
  return (scrollInProgress = new Promise(async function(resolve, reject) {
    ScrollableContainer.scrollTo(currentScrollOptions);
    let startTime = Date.now();
    let lastY = ScrollableContainer.currentScroll;
    let inactivityStart = null;
    let checks = 0;

    const checkScroll = () => {
      const currentY = ScrollableContainer.currentScroll;
      if (lastY === currentY && !inactivityStart) inactivityStart = Date.now();
      if (lastY !== currentY) inactivityStart = null;
      if (lastY === currentY && checks < 1) {
        ScrollableContainer.scrollTo(currentScrollOptions);
      }

      lastY = currentY;
      checks++;

      if (inactivityStart && (Date.now() - inactivityStart > 1000)) {
        scrollInProgress = null;
        return resolve(false); // the user prevented the scroll from completing
      }

      if (Math.abs(currentY - options.top) < 10) {
        scrollInProgress = null;
        resolve(true); // Resolve the promise when close to the target
      } else {
        setTimeout(checkScroll, 50); // Recheck after 50 milliseconds
      }
    };

    setTimeout(checkScroll, 50); // Start checking after 50 milliseconds
  }));
}

// Different animation cases to handle:
// - Switching between links in the same paragraph in a two-step animation

function shouldAnimate(pathToDisplay, linkToSelect, options = {}) { // we animate when the new path overlaps a bit but goes far up or in a different direction
  if (!Path.rendered) return false;  // user may be changing URL first so we use path from DOM
  if (!pathToDisplay.paragraph) return false;
  if (options.noScroll || options.noAnimate || options.initialLoad || options.noDisplay || options.scrollStyle === 'instant') return false;

  let firstDestinationElementY = ((options.scrollToParagraph || !linkToSelect) ? pathToDisplay.paragraph : linkToSelect).top + ScrollableContainer.currentScroll;
  let firstDestinationY = firstDestinationElementY - ScrollableContainer.focusGap;
  let longDistanceUp = firstDestinationY - ScrollableContainer.currentScroll < -ScrollableContainer.focusGap;

  let twoStepChange = !!Path.rendered.overlap(pathToDisplay)
    && !Path.rendered.equals(pathToDisplay)
    && !Path.rendered.subsetOf(pathToDisplay)
    && !Path.rendered.siblingOf(pathToDisplay)
    && !pathToDisplay.parentOf(Path.rendered); // this doesn't disqualify animation but we would require a large gap

  return longDistanceUp || twoStepChange;
}

function animatePathChange(newPath, linkToSelect, options = {}) {
  // We do not want the content the user is looking at to appear or disappear.
  // Case #1: If we are animating upward motion, we want to move up first, then remove lower content.
  // Case #2: If we are animating downward motion, we want to add lower content, then scroll to that content, which is done in scrollPage
  // Case #3: Upward followed by downward motion, so we do #1 followed by #2 (below)

  let previousPath = Link.selection?.effectivePathReference ? Link.selection.enclosingPath : Path.rendered;
  let overlapPath = previousPath.overlap(newPath);
  let strictlyUpward = newPath.subsetOf(previousPath);
  let targetElement = (linkToSelect.onCurrentPage && linkToSelect?.element) // if moving to visible link target link, otherwise target fulcrum paragraph
    || /*overlapPath.parentLink?.element ||*/ overlapPath.paragraph?.paragraphElement;

  let minDiff = options.noMinDiff ? null : 75;
  let firstTargetRatio = targetElement.tagName === 'A' ? 0.3 : 0.2; // paragraphs should be higher to be focused than links

  return (!elementIsFocused(targetElement) ? (scrollElementToPosition(targetElement,
      {targetRatio: firstTargetRatio, maxScrollRatio: Infinity, minDiff, behavior: 'smooth', side: 'top' }
    ).then(() => new Promise(resolve => setTimeout(resolve, 110)))) : Promise.resolve())
    .then(() => linkToSelect?.select({noScroll: true, noAnimate: true, ...options}) || newPath.display({noScroll: true, noAnimate: true, ...options}))
    .then(() => !strictlyUpward && new Promise(resolve => setTimeout(resolve, 150)))
    .then(() => !strictlyUpward && !elementIsFocused(newPath.paragraph.paragraphElement) && scrollElementToPosition( // if new path is not subset, we continue down new path
      newPath.paragraph.paragraphElement,
      {targetRatio: 0.25, maxScrollRatio: Infinity, minDiff: 0, behavior: 'smooth', side: 'top' })
    );
}

function elementIsFocused(element) {
  const rect = element.getBoundingClientRect(); // Get the bounding rectangle of the element

  // Define the viewport range for the element to be considered "focused"
  const upperViewportLimit = ScrollableContainer.visibleHeight * 0.3; // Element's bottom must be lower than this to be considered "focused"
  const lowerViewportLimit = ScrollableContainer.visibleHeight * 0.1; // Element's top must be higher than this to be considered "focused"

  // Check if the element's bottom is below the upper limit of the viewport range
  const isBelowUpperLimit = rect.bottom > upperViewportLimit;
  // Check if the element's top is above the lower limit of the viewport range
  const isAboveLowerLimit = rect.top < lowerViewportLimit;

  // The element is considered "focused" if it's both below the upper limit and above the lower limit
  return isBelowUpperLimit && isAboveLowerLimit && rect.top > 0;
}

export {
  setHeader,
  resetDom,
  tryPathPrefix,
  scrollPage,
  scrollElementToPosition,
  shouldAnimate,
  animatePathChange,
  scrollToWithPromise,
  getScrollInProgress
};
