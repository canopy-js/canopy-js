import { canopyContainer } from 'helpers/getters';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import Paragraph from 'models/paragraph';
import updateView from 'display/update_view';
import renderTokenElement from 'render/render_token_element';
import fetchAndRenderPath from 'render/fetch_and_render_path';

function setHeader(topic, displayOptions) {
  let headerDomElement = document.querySelector(`h1[data-topic-name="${topic.escapedMixedCase}"]`);
  headerDomElement.style.display = 'block';
  headerDomElement.style.opacity = '0%';
  if (displayOptions.scrollStyle !== 'auto') {
    headerDomElement.style.opacity = '100%'; // the page is scrolled to the right position so there wont be a jump
  }
  return { show: () => { headerDomElement.style.opacity = '100%' } };
}

function hideAllSectionElements() {
  Array.from(document.getElementsByTagName("section")).forEach((sectionElement) => {
    sectionElement.style.display = 'none';
  });
}

function deselectAllLinks() {
  Array.from(document.getElementsByTagName("a")).forEach((linkElement) => {
    linkElement.classList.remove('canopy-selected-link');
    linkElement.classList.remove('canopy-open-link');
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
  deselectAllLinks();
  hideAllSectionElements();
  deselectSectionElement();
  removeScrollCompleteClass();
}

function scrollPage(link, displayOptions) {
  let behavior = displayOptions.scrollStyle || 'smooth';
  canopyContainer.dataset.imageLoadScrollBehavior = behavior; // if images later load, follow the most recent scroll behavior
  canopyContainer.dataset.initialLoad = displayOptions.initialLoad;

  if (!Link.selection) return window.scrollTo({ top: 0, behavior }) || Promise.resolve();
  let maxScrollRatio = behavior === 'instant' || displayOptions.scrollTo === 'paragraph' ? Infinity : 0.75; // no limit on initial load and click

  if (displayOptions.scrollTo === 'paragraph') {
    let sectionElement = link.targetParagraph.sectionElement;
    return scrollElementToPosition(sectionElement, {targetRatio: 0.3, maxScrollRatio, minDiff: 50, behavior, side: 'top' });
  } else { // scroll to link
    const linkElement = link?.element;
    if (linkElement) {
      return scrollElementToPosition(linkElement, {targetRatio: 0.3, maxScrollRatio, minDiff: 50, behavior});
    } else {
      return scrollElementToPosition(Paragraph.current.sectionElement, {targetRatio: 0, maxScrollRatio, minDiff: 0, behavior});
    }
  }
}

function scrollElementToPosition(element, options) {
  if (!(element instanceof Element)) throw 'Argument to scrollElementToPosition must be DOM element';
  let { targetRatio, maxScrollRatio, minDiff, direction, behavior, side } = options;
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const currentScroll = window.pageYOffset;
  const documentHeight = document.documentElement.scrollHeight;
  let idealTargetPosition = viewportHeight * targetRatio;

  let pointToPutAtTarget;
  if (side === 'bottom') {
    pointToPutAtTarget = rect.bottom;
  } else if (side === 'top') {
    pointToPutAtTarget = rect.top;
  } else {
    side = 'middle';
    pointToPutAtTarget = rect.top + (rect.bottom - rect.top) / 2;
  }

  // Handling large A tags
  if (element.tagName === 'A' && (side === 'middle' || side === 'bottom')) {
    const topOffScreen = (side === 'bottom' ? 1 : .5) * (rect.bottom - rect.top) > idealTargetPosition;
    if (topOffScreen) {
      targetRatio = 0.05;
      idealTargetPosition = viewportHeight * targetRatio;
      pointToPutAtTarget = rect.top;
    }
  }

  // Determine the correct Y coordinate given the location of the target,
  let idealScrollY = pointToPutAtTarget + currentScroll - idealTargetPosition;

  // Adjust idealScrollY to the closest possible scroll position
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
    shouldScroll = minDiff && diff > minDiff;
  }

  // If the caller has constrained the scroll in a single direction, check we're going that way
  if (direction === 'up') {
    shouldScroll = shouldScroll && actualScrollY < currentScroll;
  }

  if (direction === 'down') {
    shouldScroll = shouldScroll && actualScrollY > currentScroll;
  }

  if (shouldScroll) {
    return scrollToWithPromise({ top: actualScrollY, behavior, ...options });
  } else {
    return Promise.resolve(true);
  }
}

async function  scrollToWithPromise(options) {
  return new Promise(async function(resolve, reject) {
    await scrollUpIfAtBottom(options); // avoid bug that occurs if page is at bottom
    window.scrollTo(options);
    let startTime = Date.now();  // Record the start time
    let lastY = window.scrollY;
    let inactivityStart = null;
    let checks = 0;

    const checkScroll = () => {
      if (lastY === window.scrollY && !inactivityStart) inactivityStart = Date.now();
      if (lastY !== window.scrollY) inactivityStart = null;
      if (lastY === window.scrollY && checks < 1) { window.scrollTo(options); } // kick start to fix aforementioned bug
      lastY = window.scrollY;
      checks++;

      if (inactivityStart && (Date.now() - inactivityStart > 1000)) {
        return resolve(false); // the user prevented the scroll from completing, so we don't complete the action
      }

      if (Math.abs(window.scrollY - options.top) < 10) {
        resolve(true); // Resolve the promise when the scroll position is close enough to the target
      } else {
        setTimeout(checkScroll, 50); // Recheck after 50 milliseconds
      }
    };

    setTimeout(checkScroll, 50); // Start checking after 50 milliseconds
  });

  function scrollUpIfAtBottom(options) {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight && !options.bottomAdjusted) {
      return scrollElementToPosition( // this handles bug where scroll doesn't occur if page is at bottom of screen
        Paragraph.current.paragraphElement, // scroll as high as you can without seeing content so not at bottom
        {targetRatio: 0, side: 'bottom', behavior: 'instant', bottomAdjusted: true }
      );
    }
  }
}

function validatePathAndLink(pathToDisplay, linkToSelect) {
  if (!(pathToDisplay instanceof Path)) throw new Error('Invalid path argument');
  if (linkToSelect && !(linkToSelect instanceof Link)) throw new Error('Invalid link selection argument');
}

export {
  setHeader,
  resetDom,
  tryPathPrefix,
  scrollPage,
  validatePathAndLink,
  scrollElementToPosition
};
