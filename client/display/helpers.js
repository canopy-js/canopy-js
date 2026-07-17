import { canopyContainer } from 'helpers/getters';
import ScrollableContainer from 'helpers/scrollable_container';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import Paragraph from 'models/paragraph';
import updateView from 'display/update_view';
import { createSectionElement } from 'render/render_dom_tree';

const PLACEHOLDER_REVEAL_DELAY_MS = 150;
const PLACEHOLDER_MIN_VISIBLE_MS = 200;

function setHeader(topic, displayOptions) {
  let headerDomElement = document.querySelector(`h1[data-topic-name="${topic.cssMixedCase}"]`);
  if (!headerDomElement) return null;
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
        if (!currentParagraph.valid) return; // temp used for styling
        if (!currentParagraph.path.string) console.error(element.outerHTML, JSON.stringify(currentParagraph));
        if (shouldRemove(currentParagraph.path, pathToDisplay)) {
          currentParagraph.removeFromDom();
        }
        removeUnusedChildSections(element, pathToDisplay);
      });
  }
}

// Keep anything that is equal, an ancestor of the target (including via parent chain)
function shouldRemove(candidatePath, targetPath) {
  if (candidatePath.equals(targetPath)) return false;
  if (candidatePath.ancestorOf(targetPath)) return false; // keep ancestors of target (walks parent chain)
  return true; // remove everything else (non-ancestors)
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

function tryPathPrefix(path) {
  console.error("No section element found for path:", path.string);
  if (path.length > 1) {
    console.log("Trying:", path.withoutLastSegment.string);
    return displayPath(path.withoutLastSegment, null, {scrollStyle: 'instant' });
  } else if(!path.equals(Path.default)) {
    console.error("No path prefixes remain to try. Redirecting to default topic: " + Path.default);
    return updateView(Path.default, null, { defaultRedirect: true, scrollStyle: 'instant' });
  } else {
    throw new Error('Redirect to default topic failed terminally.')
  }
}

function displayPlaceholderSection(pathToDisplay, linkToSelect, options) {
  if (options?.renderOnly) return Promise.resolve();
  if (pathToDisplay?.removeTerminalSubtopic.renderedParagraph) {
    return Promise.resolve();
  }

  let existingPlaceholder = Path.placeholderOnPath(pathToDisplay);
  let renderedPrefix = Path.renderedPrefixOf(pathToDisplay);
  let nextPlaceholderPath = pathToDisplay.slice(0, (renderedPrefix?.length || 0) + 1).removeTerminalSubtopic;
  let placeholderPath = existingPlaceholder?.path || nextPlaceholderPath;

  if (!placeholderPath) return Promise.resolve();
  let placeholderParagraph = Paragraph.byPath(placeholderPath);

  if (!placeholderParagraph) {
    let sectionElement = createSectionElement(placeholderPath.lastTopic, placeholderPath.lastSubtopic, {
      displayTopicName: placeholderPath.lastTopic.mixedCase,
      pathDepth: placeholderPath.length - 1,
      paragraphsBySubtopic: { [placeholderPath.lastTopic.mixedCase]: [] },
      pathToParagraph: placeholderPath
    });
    sectionElement.classList.add('canopy-loading-section');
    sectionElement.querySelector(':scope > p.canopy-paragraph')?.remove();

    let parentElement = placeholderPath.isPageRoot ? canopyContainer : Paragraph.byPath(placeholderPath.parentPath)?.sectionElement;

    if (!parentElement) return Promise.resolve();
    placeholderParagraph = Paragraph.registerChild(sectionElement, parentElement);
  }

  if (placeholderParagraph?.placeholder) {
    ensureLoadingGraphic(placeholderParagraph.sectionElement);
    return displayPath(placeholderPath, linkToSelect, {
      ...options,
      provisionalForPath: pathToDisplay,
      urlPath: pathToDisplay
    }).catch(e => console.error(e));
  }

  return Promise.resolve();
}

function ensureLoadingGraphic(sectionElement) {
  if (sectionElement.querySelector(':scope > .canopy-loading-graphic')) return;

  let loadingGraphicElement = createLoadingGraphicElement();
  sectionElement.prepend(loadingGraphicElement);
  window.setTimeout(() => {
    if (!sectionElement.classList.contains('canopy-loading-section')) return;

    sectionElement.dataset.canopyPlaceholderVisibleAt = String(Date.now());
    sectionElement.classList.add('canopy-loading-minimum');
    window.setTimeout(() => {
      sectionElement.classList.remove('canopy-loading-minimum');
      delete sectionElement.dataset.canopyPlaceholderVisibleAt;
    }, PLACEHOLDER_MIN_VISIBLE_MS);
  }, PLACEHOLDER_REVEAL_DELAY_MS);
}

function createLoadingGraphicElement() {
  let loadingGraphicElement = document.createElement('div');
  loadingGraphicElement.classList.add('canopy-loading-graphic');

  for (let i = 0; i < 4; i++) {
    let lineElement = document.createElement('span');
    lineElement.classList.add('canopy-loading-line');
    loadingGraphicElement.appendChild(lineElement);
  }

  return loadingGraphicElement;
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

let scrollRequestToken = 0;

const MAX_NATIVE_SMOOTH_SCROLL_DISTANCE = 2000;
const LONG_SCROLL_MIN_DURATION = 350;
const LONG_SCROLL_MAX_DURATION = 2445;
const LONG_SCROLL_DURATION_PER_SQRT_PIXEL = 22.2;
const LONG_SCROLL_END_PAUSE = 90;

function scrollToWithPromise(options) {
  const requestToken = ++scrollRequestToken;

  if (options.behavior === 'smooth' && Math.abs(ScrollableContainer.currentScroll - options.top) > MAX_NATIVE_SMOOTH_SCROLL_DISTANCE) {
    return scrollToWithControlledAnimation(options, requestToken);
  }

  return nativeScrollToWithPromise(options, requestToken);
}

function nativeScrollToWithPromise(options, requestToken) {
  return (scrollInProgress = waitForNativeScroll(options, requestToken));
}

function waitForNativeScroll(options, requestToken) {
  return new Promise(function(resolve) {
    ScrollableContainer.scrollTo(options);
    let lastY = ScrollableContainer.currentScroll;
    let inactivityStart = null;
    let checks = 0;

    const checkScroll = () => {
      if (requestToken !== scrollRequestToken) return resolve(false);

      const currentY = ScrollableContainer.currentScroll;
      if (lastY === currentY && !inactivityStart) inactivityStart = Date.now();
      if (lastY !== currentY) inactivityStart = null;
      if (lastY === currentY && checks < 1) {
        ScrollableContainer.scrollTo(options);
      }

      lastY = currentY;
      checks++;

      if (inactivityStart && (Date.now() - inactivityStart > 1000)) {
        if (requestToken === scrollRequestToken) scrollInProgress = null;
        return resolve(false); // the user prevented the scroll from completing
      }

      if (Math.abs(currentY - options.top) < 10) {
        if (requestToken === scrollRequestToken) scrollInProgress = null;
        resolve(true); // Resolve the promise when close to the target
      } else {
        setTimeout(checkScroll, 50); // Recheck after 50 milliseconds
      }
    };

    setTimeout(checkScroll, 50); // Start checking after 50 milliseconds
  });
}

function scrollToWithControlledAnimation(options, requestToken) {
  const maxScroll = ScrollableContainer.scrollHeight - ScrollableContainer.visibleHeight;
  const startY = ScrollableContainer.currentScroll;
  const targetY = Math.max(0, Math.min(options.top, maxScroll));
  const distance = targetY - startY;
  const duration = getLongScrollDuration(distance);
  const startTime = performance.now();

  if (!duration) return Promise.resolve(true);

  return (scrollInProgress = new Promise(resolve => {
    function step(currentTime) {
      if (requestToken !== scrollRequestToken) return resolve(false);

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeLongScrollProgress(progress);

      ScrollableContainer.setScrollTop(startY + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        ScrollableContainer.setScrollTop(targetY);
        setTimeout(() => {
          if (requestToken !== scrollRequestToken) return resolve(false);
          scrollInProgress = null;
          resolve(true);
        }, LONG_SCROLL_END_PAUSE);
      }
    }

    requestAnimationFrame(step);
  }));
}

function getLongScrollDuration(distance) {
  return Math.max(
    LONG_SCROLL_MIN_DURATION,
    Math.min(
      Math.sqrt(Math.abs(distance)) * LONG_SCROLL_DURATION_PER_SQRT_PIXEL,
      LONG_SCROLL_MAX_DURATION
    )
  );
}

function easeLongScrollProgress(progress) {
  return cubicBezier(progress, 0.42, 0, 0.58, 1);
}

function cubicBezier(progress, x1, y1, x2, y2) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;

  let lower = 0;
  let upper = 1;
  let t = progress;

  for (let i = 0; i < 12; i++) {
    const x = cubicBezierCoordinate(t, x1, x2);
    if (Math.abs(x - progress) < 0.0001) break;
    if (x < progress) lower = t;
    else upper = t;
    t = (lower + upper) / 2;
  }

  return cubicBezierCoordinate(t, y1, y2);
}

function cubicBezierCoordinate(t, p1, p2) {
  const inverseT = 1 - t;
  return 3 * inverseT * inverseT * t * p1 +
    3 * inverseT * t * t * p2 +
    t * t * t;
}

const LINK_TARGET_RATIO = .32;
const FULCRUM_LINK_TARGET_RATIO = .15;
const PARTIALLY_VISIBLE_LINK_TARGET_RATIO = .075;
const PARAGRAPH_TARGET_RATIO = .17;
const BIG_PARAGRAPH_TARGET_RATIO = .05;
const BIG_LINK_TARGET_RATIO = .2;

function beforeChangeScroll(newPath, linkToSelect, options = {}) {
  if (!Path.rendered) return Promise.resolve();  // user may be changing URL first so we use path from DOM
  if (!newPath.paragraph) return Promise.resolve();
  if (!newPath.initialOverlap(Path.rendered)) return Promise.resolve();
  if (options.noScroll || options.noBeforeChangeScroll || options.initialLoad || options.scrollStyle === 'instant') return Promise.resolve();
  if ((Path.current.ancestorOf(newPath) || Path.current.equals(newPath)) && !linkToSelect?.isAboveViewport) return Promise.resolve(); // moving down
  if (linkToSelect?.isBelowFocusArea) return Promise.resolve(); // avoid double downward scrolls
  if (Link.selection?.hasCloseSibling(linkToSelect) && !linkToSelect?.isAboveViewport) return Promise.resolve(); // don't swoop from one link to its horizontal sibling unless it's above viewport
  let previousPath = Link.selection?.isEffectivePathReference ? Link.selection.enclosingPath : Path.rendered;

  let minDiff = options.noMinDiff ? null : 75;

  // If it is a two step change, go to fulcrum element, otherwise go straight to final position
  let fulcrumLink = Path.rendered.twoStepChange(newPath) && previousPath.fulcrumLink(newPath);
  let targetElement = fulcrumLink?.linkElement ||
    (newPath.isFragment && newPath.parentLink?.element) ||
    (options.scrollToParagraph && !linkToSelect?.isFragment && newPath.paragraphElement) ||
    (linkToSelect?.element || newPath.paragraphElement);

  let targetLink = targetElement.tagName === 'A' && Link.for(targetElement);
  let targetRatio = targetLink ?
    (fulcrumLink ? FULCRUM_LINK_TARGET_RATIO : (targetLink.isAboveViewport && targetLink.bottom > ScrollableContainer.top ? PARTIALLY_VISIBLE_LINK_TARGET_RATIO : (targetLink.isBig ? BIG_LINK_TARGET_RATIO : LINK_TARGET_RATIO))) :
    (Paragraph.for(targetElement.parentNode).isBig ? BIG_PARAGRAPH_TARGET_RATIO : PARAGRAPH_TARGET_RATIO);

  let preChangePause = () => new Promise(resolve => setTimeout(resolve, 120))

  return (scrollElementToPosition(targetElement, {targetRatio, maxScrollRatio: Infinity, minDiff, behavior: 'smooth', side: 'top' })
    .then((scrolled) => scrolled && preChangePause())); // we only pause before change if there was a real scroll to the fulcrum link
}

function afterChangeScroll(pathToDisplay, linkToSelect, options={}) {
  if (options.noScroll || options.noAfterChangeScroll) return Promise.resolve();
  const minDiff = 15;
  let behavior = options.scrollStyle || (options.initialLoad && 'instant') || 'smooth';
  let { direction } = options;
  canopyContainer.dataset.imageLoadScrollBehavior = behavior; // if images later load, follow the most recent scroll behavior
  let postChangePause = () => options.afterChangePause ? (new Promise(resolve => setTimeout(resolve, 210))) : Promise.resolve();

  if (pathToDisplay.equals(Path.current.firstTopicPath) && !linkToSelect) {
    return scrollElementToPosition(
      Paragraph.root.contentElement, {targetRatio: 0.5, maxScrollRatio: Infinity, minDiff, behavior, side: 'top' }
    );
  }

  if ((linkToSelect||pathToDisplay.parentLink)?.isFragment) {
    return postChangePause().then(() => scrollElementToPosition(
      (linkToSelect||pathToDisplay.parentLink).element || Paragraph.root.contentElement,
      {targetRatio: LINK_TARGET_RATIO, maxScrollRatio: Infinity, minDiff, behavior, side: 'top', direction}
    ));
  }

  let maxScrollRatio = Infinity; // no limit on initial load and click

  if (!linkToSelect || (options.scrollToParagraph && !pathToDisplay?.parentLink?.isFragment)) {
    const targetElement = pathToDisplay.paragraph.contentElement;
    const paragraphTargetRatio = options.targetRatio ?? (pathToDisplay.paragraph.isBig ? BIG_PARAGRAPH_TARGET_RATIO : PARAGRAPH_TARGET_RATIO);
    return postChangePause().then(() => scrollElementToPosition(targetElement, {
      targetRatio: paragraphTargetRatio,
      maxScrollRatio,
      minDiff,
      behavior, 
      side: 'top', 
      direction // up on root needs direction to do nothing
    }));
  } else { // scroll to linkToSelect
    const linkTargetRatio = options.targetRatio ?? LINK_TARGET_RATIO;
    return postChangePause().then(() => scrollElementToPosition(linkToSelect.element, {
      targetRatio: linkTargetRatio,
      maxScrollRatio,
      minDiff,
      behavior,
      direction
    }));
  }
}

function waitForDisplaysInProgress() {
  return new Promise((resolve) => {
    function check() {
      if (!Paragraph.displayInProgress) return resolve();
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
  waitForDisplaysInProgress,
  displayPlaceholderSection
};
