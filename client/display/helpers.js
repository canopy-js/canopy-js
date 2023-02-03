import { canopyContainer } from 'helpers/getters';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import updateView from 'display/update_view';
import renderTokenElement from 'render/render_token_element';

function setHeader(topic) {
  let headerDomElement = document.querySelector(`h1[data-topic-name="${topic.escapedMixedCase}"]`);
  headerDomElement.style.display = 'block';
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
    return displayPath(path.withoutLastSegment);
  } else if(!displayOptions.defaultRedirect) {
    console.error("No path prefixes remain to try. Redirecting to default topic: " + Path.default);
    return updateView(Path.default, null, { defaultRedirect: true });
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

function scrollPage(linkToSelect, displayOptions) {
  let behavior = displayOptions.scrollStyle || 'smooth';
  let topOfNewLink = linkToSelect?.element.offsetTop || 0;
  let heightOfLink = linkToSelect?.element.offsetHeight || 0;
  let idealPositionOfLinkOnViewport = window.innerHeight * .3; // align bottom of link with eye level, to make room for child paragraph
  let top = topOfNewLink + heightOfLink - idealPositionOfLinkOnViewport;

  if (Math.abs(window.scrollY - top) > 35) { // changing link selection by more than two lines of text should trigger scroll
    window.scrollTo(
      {
        top,
        behavior
      }
    );
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
