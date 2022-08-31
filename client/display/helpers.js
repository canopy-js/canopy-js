import { canopyContainer } from 'helpers/getters';
import renderStyledText from 'render/render_styled_text';
import displayPath from 'display/display_path';
import Link from 'models/link';
import Path from 'models/path';
import updateView from 'display/update_view';

function setHeader(topicName) {
  let existingHeader = document.querySelector('#_canopy h1')
  if (existingHeader) { existingHeader.remove(); }
  let headerDomElement = document.createElement('h1');
  let styleElements = renderStyledText(topicName);
  Array.from(styleElements).forEach((element) => {headerDomElement.appendChild(element)});
  canopyContainer.prepend(headerDomElement);
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
  deselectAllLinks();
  hideAllSectionElements();
  deselectSectionElement();
}

function scrollPage(displayOptions) {
  let behavior = displayOptions.scrollStyle || 'smooth';

  window.scrollTo(
    {
      top: Link.selection.enclosingParagraph.paragraphElement.offsetTop - (window.screen.height * .3),
      behavior: behavior
    }
  );
}

export {
  setHeader,
  resetDom,
  tryPathPrefix,
  scrollPage
};
