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

const BOOTLOADER_MIN_VISIBLE_MS = 200;

function displayPath(pathToDisplay, linkToSelect, options = {}) {
  if (!pathToDisplay.recapitalize.equals(pathToDisplay)) return displayPath(pathToDisplay.recapitalize, linkToSelect, options);
  const paragraphToDisplay = Paragraph.byPath(pathToDisplay);
  if (!paragraphToDisplay) return tryPathPrefix(pathToDisplay, options);
  const displayingPlaceholder = paragraphToDisplay.placeholder;
  let linkForDisplay = paragraphToDisplay.placeholder ?
    (linkToSelect?.linkElement ? linkToSelect : null) :
    (linkToSelect?.element?.isConnected ? linkToSelect : null);
  if (linkToSelect && !linkForDisplay && !paragraphToDisplay.placeholder) {
    linkForDisplay = linkToSelect.currentDomLink;
  }
  const isTwoStepChange = Path.current.twoStepChange(pathToDisplay);
  options.afterChangePause = !options.noAfterChangePause && isTwoStepChange;

  return waitForDisplaysInProgress()
  .then(() => (Paragraph.enableDisplayInProgress()))
  .then(() => {
    if (options.provisionalForPath?.renderedParagraph) return;
    removeLoadingClass(pathToDisplay);
    return beforeChangeScroll(pathToDisplay, linkForDisplay, options); // eg long distance up or two-step path transition
  })
  .then(() => {
    if (options.provisionalForPath?.renderedParagraph) return;
    Paragraph.selection?.removeSelectionClass();
    paragraphToDisplay.addToDom(); // add before reset so classes on DOM elements are removed
    resetDom(pathToDisplay);
    if (linkToSelect && !linkForDisplay && !pathToDisplay.paragraph.placeholder) { linkToSelect?.eraseLinkData(); return queueMicrotask(() => updateView(pathToDisplay, null, options)); }
    let urlPath = options.urlPath || linkToSelect?.displayPath || pathToDisplay;
    Path.setPath(urlPath, linkForDisplay, options); // before link.select because selection cache by current URL
    if (!options.urlPath || options.urlPath.equals(pathToDisplay)) Link.persistLinkSelection(linkForDisplay); // if null, persists deselect or paragraph scroll
    Link.updateSelectionClass(linkForDisplay || pathToDisplay.parentLink); // if null, removes previous selection's class
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
    return afterChangeScroll(pathToDisplay, linkForDisplay, options)
      .then(() => {
        if (options.scrollStyle !== 'instant') return;
        pathToDisplay.paragraphs.forEach(p => p.display());
        executePreDisplayCallbacks();
      })
      .then(() => header?.show())
      .then(() => {
        pathToDisplay.paragraph.addSelectionClass(); // last for feature specs
        if (!displayingPlaceholder || !pathToDisplay.isPageRoot) removeBootloaderGraphic();
      });
  }).finally(() => {
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
  let bootloader = document.querySelector('#_canopy > .canopy-boot-loading-graphic');
  if (
    !bootloader ||
    bootloader.classList.contains('canopy-boot-loading-graphic-fading-out') ||
    bootloader.dataset.canopyBootloaderRemovalScheduled === 'true'
  ) return;

  if (!bootloader.classList.contains('canopy-boot-loading-graphic-visible')) {
    bootloader.remove();
    return;
  }

  const visibleAt = Number(bootloader.dataset.canopyBootloaderVisibleAt);
  const visibleForMs = visibleAt ? Date.now() - visibleAt : BOOTLOADER_MIN_VISIBLE_MS;
  const remainingVisibleMs = Math.max(0, BOOTLOADER_MIN_VISIBLE_MS - visibleForMs);
  if (remainingVisibleMs > 0) {
    bootloader.dataset.canopyBootloaderRemovalScheduled = 'true';
    window.setTimeout(() => {
      delete bootloader.dataset.canopyBootloaderRemovalScheduled;
      removeBootloaderGraphic();
    }, remainingVisibleMs);
    return;
  }

  bootloader.classList.add('canopy-boot-loading-graphic-fading-out');
  bootloader.addEventListener('animationend', () => bootloader.remove(), { once: true });
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
