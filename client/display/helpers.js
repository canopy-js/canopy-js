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

function scrollElementToPosition(element, options) {
  if (!(element instanceof Element)) throw new Error('Argument to scrollElementToPosition must be DOM element');
  let { targetRatio, maxScrollRatio, minDiff, direction, behavior, side } = options;

  let elementRect = element.getBoundingClientRect();
  let idealTargetPositionOnVisibleContainer = ScrollableContainer.visibleHeight * targetRatio;

  let containerPointToPutAtTarget;
  if (side === 'bottom') {
    containerPointToPutAtTarget = elementRect.bottom - ScrollableContainer.top + ScrollableContainer.currentScroll;
  } else if (side === 'middle') {
    containerPointToPutAtTarget = (elementRect.top - ScrollableContainer.top + ScrollableContainer.currentScroll) + (elementRect.height / 2);
  } else { // top
    containerPointToPutAtTarget = elementRect.top - ScrollableContainer.top + ScrollableContainer.currentScroll;
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

// In general path changes are usually one-step, and so we change the path first, then scroll to the new focus point.
// However, if we are scrolling far up, or up to a fulcrum point, changing the path, then scrolling down a new path,
// we will need a "before change" scroll in addition to this "after change" scroll.

function beforeChangeScrollNeeded(pathToDisplay, linkToSelect, options = {}) { // we animate when the new path overlaps a bit but goes far up or in a different direction
  if (!Path.rendered) return false;  // user may be changing URL first so we use path from DOM
  if (!pathToDisplay.paragraph) return false;
  if (!pathToDisplay.overlap(Path.rendered)) return false;
  if (options.noScroll || options.noBeforeChangeScroll || options.initialLoad || options.scrollStyle === 'instant') return false;

  let twoStepChange = Path.rendered.overlap(pathToDisplay)
    && !Path.rendered.equals(pathToDisplay)
    && !Path.rendered.subsetOf(pathToDisplay)
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

const LINK_TARGET_RATIO = .25;
const PARAGRAPH_TARGET_RATIO = .2;
const BIG_PARAGRAPH_TARGET_RATIO = .05;

function beforeChangeScroll(newPath, linkToSelect, options = {}) {
  if (!beforeChangeScrollNeeded(newPath, linkToSelect, options)) return Promise.resolve();
  options.beforeChangeScroll = true;
  let previousPath = Link.selection?.effectivePathReference ? Link.selection.enclosingPath : Path.rendered;
  let overlapPath = previousPath.overlap(newPath);
  let minDiff = options.noMinDiff ? null : 75;
  let targetElement = previousPath.fulcrumElement(newPath);
  let targetRatio = targetElement.tagName === 'A' ? LINK_TARGET_RATIO : PARAGRAPH_TARGET_RATIO; // paragraphs should be higher to be focused than links
  if (targetElement.tagName === 'P' && Paragraph.for(targetElement.parentNode).isBig) targetRatio = BIG_PARAGRAPH_TARGET_RATIO;

  return (!elementIsFocused(targetElement) ? 
    (scrollElementToPosition(targetElement, {targetRatio, maxScrollRatio: Infinity, minDiff, behavior: 'smooth', side: 'top' })
    .then(() => new Promise(resolve => setTimeout(resolve, 110)))) : Promise.resolve());
}

function afterChangeScroll(pathToDisplay, linkToSelect, options) {
  if (options.noScroll) return Promise.resolve();
  options = options || {};
  let behavior = options.scrollStyle || 'smooth';
  let { scrollToParagraph, direction } = options;
  scrollToParagraph = scrollToParagraph || false;
  canopyContainer.dataset.imageLoadScrollBehavior = behavior; // if images later load, follow the most recent scroll behavior
  canopyContainer.dataset.initialLoad = options.initialLoad;
  let postChangePause = options.beforeChangeScroll ? (new Promise(resolve => setTimeout(resolve, 150))) : Promise.resolve();

  if (!linkToSelect) return scrollElementToPosition(Paragraph.root.paragraphElement, {targetRatio: 0.5, maxScrollRatio: Infinity, behavior, side: 'top' });
  if (linkToSelect.isFragment) return scrollElementToPosition(linkToSelect.element, {targetRatio: LINK_TARGET_RATIO, Infinity, minDiff, behavior, side: 'top', direction});
  let maxScrollRatio = Infinity; // no limit on initial load and click
  let minDiff = 75;

  if (scrollToParagraph) {
    return postChangePause.then(() => scrollElementToPosition(pathToDisplay.paragraphElement, {
      targetRatio: pathToDisplay.paragraph.isBig ? BIG_PARAGRAPH_TARGET_RATIO : PARAGRAPH_TARGET_RATIO,
      maxScrollRatio,
      minDiff,
      behavior, 
      side: 'top', 
      direction // up on root needs direction
    }));
  } else { // scroll to linkToSelect
    let targetElement, targetRatio;
    if (linkToSelect.isIn(pathToDisplay.paragraph) && linkToSelect.enclosingParagraph.fits) {
      targetElement = linkToSelect.enclosingParagraph.paragraphElement
      targetRatio = PARAGRAPH_TARGET_RATIO;
    } else {
      targetElement = linkToSelect.element;
      targetRatio = LINK_TARGET_RATIO;
    }

    return postChangePause.then(() => scrollElementToPosition(targetElement, {targetRatio, maxScrollRatio, minDiff, behavior, direction}));
  }
}

// Old post-transition code
// .then(() => !strictlyUpward && !elementIsFocused(pathToDisplay.paragraph.paragraphElement) && scrollElementToPosition( // if new path is not subset, we continue down new path
//       (newPath.paragraph.paragraphElement.offsetHeight > 0 ? newPath.paragraph.paragraphElement : linkToSelect.element), // highlight cell
//       {targetRatio: 0.24, maxScrollRatio: Infinity, minDiff: 0, behavior: 'smooth', side: 'top' })
//     );

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
  afterChangeScroll,
  scrollElementToPosition,
  beforeChangeScroll,
  scrollToWithPromise,
  getScrollInProgress
};
