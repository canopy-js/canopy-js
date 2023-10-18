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

function hideHeaders() {
  Array.from(document.querySelectorAll('#_canopy h1')).forEach(header => {
    header.style.display = 'none';
  });
}

function tryPathPrefix(path, displayOptions) {
  console.error("No section element found for path: ", path.string);
  if (path.length > 1) {
    console.log("Trying: ", path.withoutLastSegment.string);
    return displayPath(path.withoutLastSegment, null, {scrollStyle: 'auto'});
  } else if(!displayOptions.defaultRedirect) {
    console.error("No path prefixes remain to try. Redirecting to default topic: " + Path.default);
    return updateView(Path.default, null, { defaultRedirect: true, scrollStyle: 'auto' });
  } else {
    throw new Error('Redirect to default topic failed terminally.')
  }
}

const resetDom = () => {
  hideHeaders();
  deselectAllLinks();
  hideAllSectionElements();
  deselectSectionElement();
}

function scrollPage(displayOptions) {
  // Behavior of scroll (smooth or instant)
  let behavior = displayOptions.scrollStyle || 'smooth';

  if (!Link.selection) return window.scrollTo({ top: 0, behavior })

  // Get the height of the viewport
  let viewportSize = window.innerHeight;

  // Get the current link element and its bounding rectangle
  let selectedLinkElement = Link.selection.element;
  let rect = selectedLinkElement.getBoundingClientRect();

  // Get the top position of the link relative to the viewport
  let topOfLinkInViewport = rect.top;

  // Desired position from the top of the viewport for the link to be 33% down
  let desiredTopPosition = viewportSize * 0.33;

  // Calculate the amount to scroll
  let scrollPosition = Link.selection ? window.scrollY + topOfLinkInViewport - desiredTopPosition : 0;

  // Custom behavior for image load, if applicable
  canopyContainer.dataset.imageLoadScrollBehavior = behavior; // if images later load, follow the most recent scroll behavior

  // Only scroll if the difference in scroll position is greater than 100 to avoid small, unnecessary movements
  if (Math.abs(scrollPosition - window.scrollY) > 100) {
    // Use setTimeout to give the browser a moment to complete any other tasks
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: behavior
      });
    }, 0);
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
  validatePathAndLink
};
