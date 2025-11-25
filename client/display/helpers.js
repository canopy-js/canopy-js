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

function hideHeaders() {
  Array.from(document.querySelectorAll('#_canopy h1')).forEach(header => {
    header.style.display = 'none';
  });
}

function tryPathPrefix(path, displayOptions) {
  console.error("No section element found for path:", path.string);
  if (path.length > 1) {
    console.log("Trying:", path.withoutLastSegment.string);
    return displayPath(path.withoutLastSegment, null, {scrollStyle: 'instant' });
  } else if(!displayOptions.defaultRedirect) {
    console.error("No path prefixes remain to try. Redirecting to default topic: " + Path.default);
    return updateView(Path.default, null, { defaultRedirect: true, scrollStyle: 'instant' });
  } else {
    throw new Error('Redirect to default topic failed terminally.')
  }
}

const resetDom = (pathToDisplay) => {
  hideHeaders();
  closeAllLinks();
  hideAllSectionElements(pathToDisplay); // remove top down to reduce DOM changes
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
    return Promise.resolve(false);
  }
}

let scrollInProgress = null;
function getScrollInProgress() {
  return scrollInProgress;
}

let currentScrollOptions = null; // multiple calls to scrollToWithPromise replace the desired destination

function scrollToWithPromise(options) {
  currentScrollOptions = options;
  return (scrollInProgress = new Promise(function(resolve) {
    ScrollableContainer.scrollTo(currentScrollOptions);
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

const LINK_TARGET_RATIO = .22;
const PARAGRAPH_TARGET_RATIO = .17;
const BIG_PARAGRAPH_TARGET_RATIO = .05;
const BIG_LINK_TARGET_RATIO = .1;

function beforeChangeScroll(newPath, linkToSelect, options = {}) {
  if (!Path.rendered) return Promise.resolve();  // user may be changing URL first so we use path from DOM
  if (!newPath.paragraph) return Promise.resolve();
  if (!newPath.initialOverlap(Path.rendered)) return Promise.resolve();
  if (options.noScroll || options.noBeforeChangeScroll || options.initialLoad || options.scrollStyle === 'instant') return Promise.resolve();
  if (Path.current.isIn(newPath)) return Promise.resolve(); // moving down
  if (Link.selection.hasCloseSibling(linkToSelect)) return Promise.resolve(); // don't swoop from one link to its horizontal sibling
  if (Path.rendered.fulcrumLink(newPath).isFocused) return Promise.resolve();

  let previousPath = Link.selection?.isEffectivePathReference ? Link.selection.enclosingPath : Path.rendered;
  let minDiff = options.noMinDiff ? null : 75;

  // If it is a two step change, go to fulcrum element, otherwise go straight to final position
  let targetElement = (Path.rendered.twoStepChange(newPath) && previousPath.fulcrumLink(newPath)).linkElement ||
    (options.scrollToParagraph && !linkToSelect?.isFragment && newPath.paragraphElement) ||
    (linkToSelect?.element || newPath.paragraphElement);

  let targetRatio = targetElement.tagName === 'A' ?
    (Link.for(targetElement).isBig ? BIG_LINK_TARGET_RATIO : LINK_TARGET_RATIO) :
    (Paragraph.for(targetElement.parentNode).isBig ? BIG_PARAGRAPH_TARGET_RATIO : PARAGRAPH_TARGET_RATIO);

  let preChangePause = () => new Promise(resolve => setTimeout(resolve, 130))

  return (scrollElementToPosition(targetElement, {targetRatio, maxScrollRatio: Infinity, minDiff, behavior: 'smooth', side: 'top' })
    .then((scrolled) => scrolled && preChangePause())); // we only pause before change if there was a real scroll to the fulcrum link
}

function afterChangeScroll(pathToDisplay, linkToSelect, options={}) {
  if (options.noScroll || options.noAfterChangeScroll) return Promise.resolve();
  if (linkToSelect?.isFocused) return Promise.resolve();
  let behavior = options.scrollStyle || (options.initialLoad && 'instant') || 'smooth';
  let { direction } = options;
  canopyContainer.dataset.imageLoadScrollBehavior = behavior; // if images later load, follow the most recent scroll behavior

  if (pathToDisplay.equals(Path.current.firstTopicPath) && !linkToSelect) return scrollElementToPosition(
    Paragraph.root.paragraphElement, {targetRatio: 0.5, maxScrollRatio: Infinity, behavior, side: 'top' }
  );

  if ((linkToSelect||pathToDisplay.parentLink)?.isFragment) return scrollElementToPosition(
    (linkToSelect||pathToDisplay.parentLink).element || Paragraph.root.paragraphElement, 
    {targetRatio: LINK_TARGET_RATIO, Infinity, minDiff, behavior, side: 'top', direction}
  );

  let postChangePause = () => options.afterChangePause ? (new Promise(resolve => setTimeout(resolve, 120))) : Promise.resolve();
  let maxScrollRatio = Infinity; // no limit on initial load and click
  let minDiff = 50;

  if (!linkToSelect || (options.scrollToParagraph && !pathToDisplay?.parentLink?.isFragment)) {
    return postChangePause().then(() => scrollElementToPosition(pathToDisplay.paragraphElement, {
      targetRatio: pathToDisplay.paragraph.isBig ? BIG_PARAGRAPH_TARGET_RATIO : PARAGRAPH_TARGET_RATIO,
      maxScrollRatio,
      minDiff,
      behavior, 
      side: 'top', 
      direction // up on root needs direction to do nothing
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

    return postChangePause().then(() => scrollElementToPosition(targetElement, {targetRatio, maxScrollRatio, minDiff, behavior, direction}));
  }
}

function waitForSelectedSection() {
  return new Promise((resolve) => {
    function check() {
      if (!Paragraph.contentLoaded || document.querySelector('.canopy-selected-section')) return resolve();
      setTimeout(check, 0);
    }
    check();
  });
}

export {
  setHeader,
  resetDom,
  tryPathPrefix,
  afterChangeScroll,
  scrollElementToPosition,
  beforeChangeScroll,
  scrollToWithPromise,
  getScrollInProgress,
  waitForSelectedSection
};
