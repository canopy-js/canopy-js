import { canopyContainer } from 'helpers/getters';
import ScrollableContainer from 'helpers/scrollable_container';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import Paragraph from 'models/paragraph';
import updateView from 'display/update_view';

function setHeader(topic, displayOptions) {
  let headerDomElement = document.querySelector(`h1[data-topic-name="${topic.cssMixedCase}"]`);
  headerDomElement.style.display = 'block';
  headerDomElement.style.opacity = '0%';
  if (displayOptions.scrollStyle !== 'instant') {
    headerDomElement.style.opacity = '100%'; // the page is scrolled to the right position so there wont be a jump
  }
  return { show: () => { headerDomElement.style.opacity = '100%' } };
}

function hideAllSectionElements(pathToDisplay) {
  removeUnusedChildSections(canopyContainer, pathToDisplay);

  function removeUnusedChildSections(parentElement, pathToDisplay) { // remove all elements from parents top-down to reduce dom changes
    Array.from(parentElement.childNodes)
      .filter(element => element.tagName === 'SECTION')
      .forEach(element => {
        let currentParagraph = Paragraph.for(element);
        if (!currentParagraph.path.isIn(pathToDisplay)) currentParagraph.removeFromDom();
        removeUnusedChildSections(element, pathToDisplay);
      });
  }
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

function hideHeaders() {
  Array.from(document.querySelectorAll('#_canopy h1')).forEach(header => {
    header.style.display = 'none';
  });
}

function tryPathPrefix(path, displayOptions) {
  console.error("No section element found for path:", path.string);
  if (path.length > 1) {
    console.log("Trying:", path.withoutLastSegment.string);
    return displayPath(path.withoutLastSegment, null, {scrollStyle: 'instant', replaceHistoryState: true });
  } else if(!displayOptions.defaultRedirect) {
    console.error("No path prefixes remain to try. Redirecting to default topic: " + Path.default);
    return updateView(Path.default, null, { defaultRedirect: true, scrollStyle: 'instant', replaceHistoryState: true });
  } else {
    throw new Error('Redirect to default topic failed terminally.')
  }
}

const resetDom = (pathToDisplay) => {
  hideHeaders();
  closeAllLinks();
  hideAllSectionElements(pathToDisplay);
  deselectSectionElement();
}

function scrollPage(link, options) {
  options = options || {};
  let behavior = options.scrollStyle || 'smooth';
  let { scrollToParagraph, direction } = options;
  canopyContainer.dataset.imageLoadScrollBehavior = behavior; // if images later load, follow the most recent scroll behavior
  canopyContainer.dataset.initialLoad = options.initialLoad;

  if (!link) return scrollElementToPosition(Paragraph.root.paragraphElement, {targetRatio: 0.5, maxScrollRatio: Infinity, behavior, side: 'top' });
  let maxScrollRatio = Infinity; //behavior === 'instant' || scrollToParagraph || options.scrollDirect ? Infinity : 0.75; // no limit on initial load and click
  let minDiff = 75; //(maxScrollRatio === Infinity) ? null : 75;
  if (link?.childParagraph?.paragraphElement?.offsetHeight === 0) return scrollElementToPosition(link.element, // highlight table cell
    {targetRatio: 0.25, Infinity, minDiff, behavior, side: 'top', direction});

  if (scrollToParagraph) {
    let paragraphPercent = link.childParagraph.paragraphElement.offsetHeight / ScrollableContainer.visibleHeight;
    let targetRatio = paragraphPercent > .4 ? .15 : 0.4;
    return scrollElementToPosition(link.childParagraph.paragraphElement,
      {targetRatio, maxScrollRatio, minDiff, behavior, side: 'top', direction}); // up on root needs direction
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
  if (ScrollableContainer.scrollHeight - ScrollableContainer.visibleHeight < idealScrollY) console.error('Scrollable area not long enough to scroll to desired position');
  idealScrollY = Math.max(0, Math.min(idealScrollY, ScrollableContainer.scrollHeight - ScrollableContainer.visibleHeight));

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
  if (!pathToDisplay.overlap(Path.rendered)) return false;
  if (options.noScroll || options.noAnimate || options.initialLoad || options.scrollStyle === 'instant') return false;

  let twoStepChange = Path.rendered.overlap(pathToDisplay)
    && !Path.rendered.equals(pathToDisplay)
    && !Path.rendered.subsetOf(pathToDisplay)
    && !Path.rendered.siblingOf(pathToDisplay)
    && (!linkToSelect || !linkToSelect.siblingOf(Link.selection))
    && !pathToDisplay.parentOf(Path.rendered) // this doesn't disqualify animation but we would require a large gap
    && !(pathToDisplay.overlap(Path.rendered).equals(Path.rendered)) // eg shortcut that selects sibling link
    && !linkToSelect.equals(Link.selection.parentLink);

  let firstDestinationElement = (options.scrollToParagraph || !linkToSelect) ? Path.rendered.firstDestination(pathToDisplay).paragraph : linkToSelect;
  let firstDestinationElementYRelative = firstDestinationElement.top;
  let firstDestinationElementYAbsolute = firstDestinationElementYRelative + ScrollableContainer.currentScroll; // we need absolute to detect doc top then convert
  let firstDestinationScrollYAbsolute = Math.max(firstDestinationElementYAbsolute - ScrollableContainer.focusGap, 0);
  let scrollDistanceUp = firstDestinationScrollYAbsolute - ScrollableContainer.currentScroll;
  let bigDistanceUp = -0.6 * ScrollableContainer.visibleHeight;
  let distanceToFirstDestinationVeryLarge = scrollDistanceUp < bigDistanceUp; // must be negative ie up
  let longDistanceUp = distanceToFirstDestinationVeryLarge; // we no longer check if top element is off screen, because either dist-large or two-step

  return twoStepChange || longDistanceUp;
}

function animatePathChange(newPath, linkToSelect, options = {}) {
  // We do not want the content the user is looking at to appear or disappear.
  // Case #1: If we are animating upward motion, we want to move up first, then remove lower content (below)
  // Case #2: If we are animating downward motion, we want to add lower content, then scroll to that content, which is done in scrollPage
  // Case #3: Upward followed by downward motion, so we do #1 followed by #2 (below)

  let previousPath = Link.selection?.effectivePathReference ? Link.selection.enclosingPath : Path.rendered;
  let overlapPath = previousPath.overlap(newPath);
  let strictlyUpward = newPath.subsetOf(previousPath);
  let targetElement = (linkToSelect?.onPage && !strictlyUpward && linkToSelect?.element) // if moving to visible link target link, otherwise target fulcrum paragraph
    || overlapPath.paragraph?.paragraphElement;

  let minDiff = options.noMinDiff ? null : 75;
  let firstTargetRatio = targetElement.tagName === 'A' ? 0.3 : 0.2; // paragraphs should be higher to be focused than links

  if (previousPath.includes(newPath)) { // ie for cycle reduction
    firstTargetRatio = 0.45;
    targetElement = overlapPath.paragraph?.paragraphElement;
  }

  return (!elementIsFocused(targetElement) ? (scrollElementToPosition(targetElement,
      {targetRatio: firstTargetRatio, maxScrollRatio: Infinity, minDiff, behavior: 'smooth', side: 'top' }
    ).then(() => new Promise(resolve => setTimeout(resolve, 110)))) : Promise.resolve())
    .then(() => linkToSelect?.select({noScroll: true, noAnimate: true, ...options}) || newPath.display({noScroll: true, noAnimate: true, ...options}))
    .then(() => !strictlyUpward && new Promise(resolve => setTimeout(resolve, 150)))
    .then(() => !strictlyUpward && !elementIsFocused(newPath.paragraph.paragraphElement) && scrollElementToPosition( // if new path is not subset, we continue down new path
      (newPath.paragraph.paragraphElement.offsetHeight > 0 ? newPath.paragraph.paragraphElement : linkToSelect.element), // highlight cell
      {targetRatio: 0.24, maxScrollRatio: Infinity, minDiff: 0, behavior: 'smooth', side: 'top' })
    );
}

function elementIsFocused(element) {
  const rect = element.getBoundingClientRect(); // Get the bounding rectangle of the element

  // Define the viewport height thresholds for the element to be considered within the desired vertical range
  const topThreshold = ScrollableContainer.visibleHeight * 0.1;
  const bottomThreshold = ScrollableContainer.visibleHeight * 0.4;

  // Check if the entire element is within the 5% to 50% range of the viewport
  // The top of the element should be below the top threshold (5% mark)
  // The bottom of the element should be above the bottom threshold (50% mark)
  // This ensures the entire element is between 5% and 50% of the viewport vertically
  return rect.top >= topThreshold && rect.bottom <= bottomThreshold;
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
