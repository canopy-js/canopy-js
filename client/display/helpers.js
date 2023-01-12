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

function scrollPage(displayOptions) {
  let behavior = displayOptions.scrollStyle || 'smooth';
  let top = Link.selection ? Link.selection.element.offsetTop - (window.screen.height * .23) : 0;

  window.scrollTo(
    {
      top,
      behavior
    }
  );
}

// We don't want a line break between the last word and the external link icon, or the icon and a following punctuation mark
// Eg "word1 word2[icon]." - we don't want line break between word2-icon or icon-., so if we detect, add BR after word1

// So, every time there is a page change or a resize, we check if there are any external link icons on a different line than
// the word that came before them or the text that came after them, and if so, we insert a break tag before the last word before
// the icon, so that the last word, icon, and terminating punctuation all fall out on the next line together.

function fixExternalLinkIcons() {
  Array.from(document.querySelectorAll('.canopy-url-link-break-tag:not([hidden])')).forEach(el => el.remove());
  Array.from(document.querySelectorAll('.canopy-url-link-svg-container:not([hidden])')).forEach(svgContainer => {
    let tokensContainer = svgContainer.parentElement.querySelector('.canopy-url-link-tokens-container');
    let elementAfterLink = svgContainer.parentElement.nextSibling;

    if (document.querySelector('.canopy-selected-section')?.contains(svgContainer)) { // link is visible
      let lineBreakBetweenWordAndIcon = (svgContainer.getBoundingClientRect().bottom - tokensContainer.getBoundingClientRect().bottom) > 1; // If the icon is lower than the link text

      let punctuationAfterIcon = !!elementAfterLink?.innerText?.match(/^[,.:\-;"'\[\]\(\){}](\s|$)/);
      let lineBreakBetweenIconAndPunctuation = punctuationAfterIcon && // the text after the icon is punctuation connected to the link text, like a period.
        ((elementAfterLink?.getBoundingClientRect().bottom - svgContainer.getBoundingClientRect().bottom) > 1); // the text after the icon is lower than the icon

      if (lineBreakBetweenWordAndIcon || lineBreakBetweenIconAndPunctuation) {
        tokensContainer.innerHTML = tokensContainer.innerHTML.replace(/(\S*)<\/span>$/, (s) => '<span class="canopy-url-link-break-tag"><br></span>' + s)
      }
    }
  });
}

addEventListener("resize", fixExternalLinkIcons);

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
  fixExternalLinkIcons
};
