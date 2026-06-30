import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';
import updateView from 'display/update_view';
import {
  setHeader,
  tryPathPrefix,
  resetDom,
  beforeChangeScroll,
  afterChangeScroll,
  waitForDisplaysInProgress
} from 'display/helpers';

let displayPathRequestId = 0;

function debugDisplayPath(_requestId, _message, _pathToDisplay, _linkToSelect, _options = {}) {
  return;
}

function displayPath(pathToDisplay, linkToSelect, options = {}) {
  const requestId = ++displayPathRequestId;
  debugDisplayPath(requestId, 'start', pathToDisplay, linkToSelect, options);
  if (!pathToDisplay.recapitalize.equals(pathToDisplay)) return displayPath(pathToDisplay.recapitalize, linkToSelect, options);
  if (!Paragraph.byPath(pathToDisplay)) return tryPathPrefix(pathToDisplay, options);
  const displayingPlaceholder = pathToDisplay.paragraph.placeholder;
  let linkForDisplay = pathToDisplay.paragraph.placeholder ?
    (linkToSelect?.linkElement ? linkToSelect : null) :
    (linkToSelect?.element?.isConnected ? linkToSelect : null);
  if (linkToSelect && !linkForDisplay && !pathToDisplay.paragraph.placeholder) {
    linkForDisplay = linkToSelect.currentDomLink;
  }
  const isTwoStepChange = Path.current.twoStepChange(pathToDisplay);
  options.afterChangePause = !options.noAfterChangePause && isTwoStepChange;

  return waitForDisplaysInProgress()
  .then(() => (Paragraph.enableDisplayInProgress()))
  .then(() => debugDisplayPath(requestId, 'lock acquired', pathToDisplay, linkForDisplay, options))
  .then(() => removeLoadingClass(pathToDisplay))
  .then(() => beforeChangeScroll(pathToDisplay, linkForDisplay, options)) // eg long distance up or two-step path transition
  .then(() => {
    debugDisplayPath(requestId, 'before resetDom', pathToDisplay, linkForDisplay, options);
    Paragraph.selection?.removeSelectionClass();
    Paragraph.byPath(pathToDisplay).addToDom(); // add before reset so classes on DOM elements are removed
    resetDom(pathToDisplay);
    if (linkToSelect && !linkForDisplay && !pathToDisplay.paragraph.placeholder) { linkToSelect?.eraseLinkData(); return queueMicrotask(() => updateView(pathToDisplay, null, options)); }
    let urlPath = options.urlPath || linkToSelect?.displayPath || pathToDisplay;
    Path.setPath(urlPath, linkForDisplay, options); // before link.select because selection cache by current URL
    if (!options.urlPath || options.urlPath.equals(pathToDisplay)) Link.persistLinkSelection(linkForDisplay); // if null, persists deselect or paragraph scroll
    Link.updateSelectionClass(linkForDisplay || pathToDisplay.parentLink); // if null, removes previous selection's class
    debugDisplayPath(requestId, 'after selection update', pathToDisplay, linkForDisplay, options);
    let header = setHeader(pathToDisplay.firstTopicPath.firstTopic, options);
    document.title = pathToDisplay.pageTitle;
    Path.lastRenderedPath = pathToDisplay;

    displayPathTo(pathToDisplay.paragraph, options);
    const executePreDisplayCallbacks = () => pathToDisplay.paragraphs.forEach(p => queueMicrotask(() => p.executePreDisplayCallbacks())); // for initial load when didn't run at render
    if (options.scrollStyle !== 'instant') {
      pathToDisplay.paragraphs.forEach(p => p.display());
      executePreDisplayCallbacks();
    }
    Link.eagerLoadLinks(options);
    if (!displayingPlaceholder || !pathToDisplay.isPageRoot) removeBootloaderGraphic();

    return afterChangeScroll(pathToDisplay, linkForDisplay, options)
      .then(() => {
        if (options.scrollStyle !== 'instant') return;
        pathToDisplay.paragraphs.forEach(p => p.display());
        executePreDisplayCallbacks();
      })
      .then(() => header?.show())
      .then(() => {
        pathToDisplay.paragraph.addSelectionClass(); // last for feature specs
        debugDisplayPath(requestId, 'complete', pathToDisplay, linkForDisplay, options);
      });
  }).finally(() => {
    debugDisplayPath(requestId, 'lock released', pathToDisplay, linkForDisplay, options);
    Paragraph.disableDisplayInProgress();
  });
}

function removeLoadingClass(pathToDisplay) {
  let paragraph = pathToDisplay.renderedParagraph;
  if (!paragraph) return;

  while (paragraph) {
    paragraph.sectionElement.classList.remove('canopy-loading-section');
    paragraph = paragraph.parentParagraph;
  }
}

function removeBootloaderGraphic() {
  document.querySelector('#_canopy > .canopy-boot-loading-graphic')?.remove();
}

const displayPathTo = (paragraph) => {
  while (paragraph) {
    paragraph.allocateSpace(); // lets us scroll to right place for instant & run predisplay callbacks for both
    if (paragraph.parentLink) paragraph.parentLinks.forEach((parentLink) => parentLink.open()); // remember open links of path reference
    Link.persistLinkSelectionInSession(paragraph.parentLink); // being an open link makes that link the most recently selected for its paragraph
    paragraph = paragraph.parentParagraph;
  }
}

export default displayPath;
