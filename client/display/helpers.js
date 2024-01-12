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
    return displayPath(path.withoutLastSegment, null, {scrollStyle: 'smooth'});
  } else if(!displayOptions.defaultRedirect) {
    console.error("No path prefixes remain to try. Redirecting to default topic: " + Path.default);
    return updateView(Path.default, null, { defaultRedirect: true, scrollStyle: 'smooth' });
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

function scrollPage(link, displayOptions) {
  displayOptions = displayOptions || {};
  let behavior = displayOptions.scrollStyle || 'smooth';
  let { scrollToParagraph } = displayOptions;
  canopyContainer.dataset.imageLoadScrollBehavior = behavior; // if images later load, follow the most recent scroll behavior
  canopyContainer.dataset.initialLoad = displayOptions.initialLoad;

  if (!link) return scrollElementToPosition(Paragraph.root.paragraphElement, {targetRatio: 0.5, maxScrollRatio: Infinity, behavior, side: 'top' });
  let maxScrollRatio = behavior === 'instant' || scrollToParagraph || displayOptions.scrollDirect ? Infinity : 0.75; // no limit on initial load and click

  if (scrollToParagraph) {
    let sectionElement = link.targetParagraph.paragraphElement;
    return scrollElementToPosition(sectionElement, {targetRatio: 0.4, maxScrollRatio, minDiff: 100, behavior, side: 'top' });
  } else { // scroll to link
    const linkElement = link?.element;
    if (linkElement) {
      return scrollElementToPosition(linkElement, {targetRatio: 0.3, maxScrollRatio, minDiff: 100, behavior});
    } else { // root paragraph
      return scrollElementToPosition(Paragraph.current.sectionElement, {targetRatio: 0, maxScrollRatio, minDiff: 100, behavior});
    }
  }
}

function scrollElementToPosition(element, options) {
  if (!(element instanceof Element)) throw new Error('Argument to scrollElementToPosition must be DOM element');
  let { targetRatio, maxScrollRatio, minDiff, direction, behavior, side } = options;

  const scrollableContainer = isElementScrollable(canopyContainer.parentElement) ? canopyContainer.parentElement : document.documentElement;
  const elementRect = element.getBoundingClientRect();

  const viewportHeight = scrollableContainer.clientHeight;
  const currentScroll = scrollableContainer.scrollTop;
  const documentHeight = scrollableContainer.scrollHeight;
  let idealTargetPositionOnViewport = viewportHeight * targetRatio;

  let viewportPointToPutAtTarget;
  if (side === 'bottom') {
    viewportPointToPutAtTarget = elementRect.bottom + currentScroll;
  } else if (side === 'top') {
    viewportPointToPutAtTarget = elementRect.top + currentScroll;
  } else {
    side = 'middle';
    viewportPointToPutAtTarget = (elementRect.top + currentScroll) + (elementRect.height / 2);
  }

  if (element.tagName === 'A') {
    const paragraphElement = element.closest('p.canopy-paragraph');
    const paragraphRect = paragraphElement.getBoundingClientRect();
    const linkRect = element.getBoundingClientRect();

    // Calculate the new scroll position and check if the paragraph top goes off-screen
    const hypotheticalScrollPosition = currentScroll + viewportPointToPutAtTarget - idealTargetPositionOnViewport;
    if (paragraphRect.top + currentScroll - hypotheticalScrollPosition < 0) {
      // Check if placing the paragraph top at 5% of the viewport height will put the link below the viewport's midpoint
      const paragraphTopAtFivePercent = viewportHeight * 0.05;
      const linkMidpoint = (linkRect.top + linkRect.bottom) / 2;
      const linkPositionAfterAdjustment = paragraphTopAtFivePercent + linkMidpoint - paragraphRect.top;

      if (linkPositionAfterAdjustment < viewportHeight * 0.5) {
        // Adjust the target position to place the paragraph top at 5% of the viewport
        viewportPointToPutAtTarget = paragraphRect.top + currentScroll - paragraphTopAtFivePercent;
        idealScrollY = viewportPointToPutAtTarget - idealTargetPositionOnViewport;
      }
    }
  }

  // Handling large A tags
  if (element.tagName === 'A' && (side === 'middle' || side === 'bottom')) {
    const topOffScreen = (side === 'bottom' ? 1 : .5) * (elementRect.bottom - elementRect.top) > idealTargetPositionOnViewport;
    if (topOffScreen) {
      targetRatio = 0.05;
      idealTargetPositionOnViewport = viewportHeight * targetRatio;
      viewportPointToPutAtTarget = elementRect.top;
    }
  }

  let idealScrollY = viewportPointToPutAtTarget - idealTargetPositionOnViewport;

  // Adjust idealScrollY to the closest possible scroll position
  if (documentHeight - viewportHeight < idealScrollY) {
    console.error('Scrollable area not long enough to scroll to desired position');
  }
  idealScrollY = Math.max(0, Math.min(idealScrollY, documentHeight - viewportHeight));

  // Use the calculated scroll or max scroll if it is too big
  const maxScrollDistance = maxScrollRatio ? viewportHeight * maxScrollRatio : Infinity;
  let actualScrollY;
  if (idealScrollY > currentScroll) {
    actualScrollY = Math.min(idealScrollY, currentScroll + maxScrollDistance);
  } else {
    actualScrollY = Math.max(idealScrollY, currentScroll - maxScrollDistance);
  }

  let shouldScroll = idealScrollY !== 0;

  // Check that the scroll is larger than the minimum we would initiate a scroll for
  if (minDiff) {
    const diff = Math.abs(currentScroll - actualScrollY);
    let linkOffScreen = element.tagName === 'A' && (elementRect.top < 5 || elementRect.bottom > viewportHeight);
    shouldScroll = !minDiff || (minDiff && (diff > minDiff)) || linkOffScreen;
  }

  // If the caller has constrained the scroll in a single direction, check we're going that way
  if (direction === 'up') {
    shouldScroll = shouldScroll && actualScrollY < currentScroll;
  }

  if (direction === 'down') {
    shouldScroll = shouldScroll && actualScrollY > currentScroll;
  }

  if (shouldScroll) {
    return scrollToWithPromise({ top: actualScrollY, behavior, ...options }, scrollableContainer);
  } else {
    return Promise.resolve(true);
  }
}

async function scrollToWithPromise(options, scrollableContainer = document.documentElement) {
  return new Promise(async function(resolve, reject) {
    await scrollUpIfAtBottom(options, scrollableContainer);
    (scrollableContainer.scrollTo || window.scrollTo).call(scrollableContainer, options);
    let startTime = Date.now();
    let lastY = scrollableContainer.scrollTop || window.scrollY;
    let inactivityStart = null;
    let checks = 0;

    const checkScroll = () => {
      const currentY = scrollableContainer.scrollTop || window.scrollY;
      if (lastY === currentY && !inactivityStart) inactivityStart = Date.now();
      if (lastY !== currentY) inactivityStart = null;
      if (lastY === currentY && checks < 1) {
        (scrollableContainer.scrollTo || window.scrollTo).call(scrollableContainer, options);
      }
      lastY = currentY;
      checks++;

      if (inactivityStart && (Date.now() - inactivityStart > 1000)) {
        return resolve(false); // the user prevented the scroll from completing
      }

      if (Math.abs(currentY - options.top) < 10) {
        resolve(true); // Resolve the promise when close to the target
      } else {
        setTimeout(checkScroll, 50); // Recheck after 50 milliseconds
      }
    };

    setTimeout(checkScroll, 50); // Start checking after 50 milliseconds
  });

  function scrollUpIfAtBottom(options = {}, container = document.documentElement) {
    const scrollPosition = container.scrollTop || window.scrollY;
    const containerHeight = container.clientHeight || window.innerHeight;
    const scrollHeight = container.scrollHeight || document.documentElement.scrollHeight;

    if (containerHeight + scrollPosition >= scrollHeight && !options.bottomAdjusted) {
      return scrollElementToPosition(
        Paragraph.current.paragraphElement,
        {targetRatio: 0, side: 'bottom', behavior: 'instant', bottomAdjusted: true },
        container
      );
    }
  }
}

function isElementScrollable(element) {
  const overflowY = window.getComputedStyle(element).overflowY;
  const isOverflowScrollable = overflowY === 'scroll' || overflowY === 'auto';
  const contentOverflows = element.scrollHeight > element.clientHeight;
  return isOverflowScrollable && contentOverflows;
}

function animatePathChange(newPath, linkToSelect, options = {}) {
  // We do not want the content the user is looking at to appear or disappear.
  // Case #1: If we are animating upward motion, we want to move up first, (below), then remove later content.
  // Case #2: If we are animating downward motion, we want to add later content, then scroll to that content, which is done in scrollPage
  // Case #3: Upward followed by downward motion, we do #1 (below) followed by #2 (below)

  let previousPath = Link.selection.effectivePathReference ? Link.selection.enclosingPath : Path.rendered;
  let overlapPath = previousPath.overlap(newPath);
  let strictlyUpward = newPath.subsetOf(previousPath);
  let targetElement = strictlyUpward ?
    (linkToSelect?.element || overlapPath.parentLink?.element || overlapPath.paragraph?.paragraphElement)
    : overlapPath.paragraph.paragraphElement;

  return (!elementIsFocused(targetElement) ? (scrollElementToPosition(targetElement,
      {targetRatio: 0.3, maxScrollRatio: Infinity, minDiff: 50, behavior: 'smooth', side: 'top' }
    ).then(() => new Promise(resolve => setTimeout(resolve, 110)))) : Promise.resolve())
    .then(() => linkToSelect?.select({noScroll: true, noAnimate: true, ...options}) || newPath.display({noScroll: true, noAnimate: true, ...options}))
    .then(() => !strictlyUpward && new Promise(resolve => setTimeout(resolve, 150)))
    .then(() => !strictlyUpward && !elementIsFocused(newPath.paragraph.paragraphElement) && scrollElementToPosition( // if new path is not subset, we continue down new path
      newPath.paragraph.paragraphElement,
      {targetRatio: 0.25, maxScrollRatio: Infinity, minDiff: 50, behavior: 'smooth', side: 'top' })
    );
}

function elementIsFocused(element) {
  const rect = element.getBoundingClientRect(); // Get the bounding rectangle of the element
  const scrollableContainer = isElementScrollable(canopyContainer.parentElement) ? canopyContainer.parentElement : document.documentElement;
  const viewportHeight = scrollableContainer.clientHeight;

  // Define the viewport range for the element to be considered "focused"
  const upperViewportLimit = viewportHeight * 0.3; // Element's bottom must be lower than this to be considered "focused"
  const lowerViewportLimit = viewportHeight * 0.5; // Element's top must be higher than this to be considered "focused"

  // Check if the element's bottom is below the upper limit of the viewport range
  const isBelowUpperLimit = rect.bottom > upperViewportLimit;
  console.log(element, isBelowUpperLimit, rect.bottom, upperViewportLimit)
  // Check if the element's top is above the lower limit of the viewport range
  const isAboveLowerLimit = rect.top < lowerViewportLimit;
  console.log(isAboveLowerLimit, rect.top, lowerViewportLimit)

  // The element is considered "focused" if it's both below the upper limit and above the lower limit
  return isBelowUpperLimit && isAboveLowerLimit;
}

export {
  setHeader,
  resetDom,
  tryPathPrefix,
  scrollPage,
  scrollElementToPosition,
  animatePathChange
};
