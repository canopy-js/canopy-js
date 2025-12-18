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

function displayPath(pathToDisplay, linkToSelect, options = {}) {
  if (!pathToDisplay.recapitalize.equals(pathToDisplay)) return displayPath(pathToDisplay.recapitalize, linkToSelect, options);
  if (!Paragraph.byPath(pathToDisplay)) return tryPathPrefix(pathToDisplay, options);
  options.afterChangePause = !options.noAfterChangePause && Path.current.twoStepChange(pathToDisplay);

  return waitForDisplaysInProgress()
  .then(() => (Paragraph.enableDisplayInProgress()))
  .then(() => beforeChangeScroll(pathToDisplay, linkToSelect, options)) // eg long distance up or two-step path transition
  .then(() => {
    Paragraph.selection?.removeSelectionClass();
    Paragraph.byPath(pathToDisplay).addToDom(); // add before reset so classes on DOM elements are removed
    resetDom(pathToDisplay);
    if (linkToSelect && !linkToSelect.element) { linkToSelect?.eraseLinkData(); return queueMicrotask(() => updateView(pathToDisplay, null, options)); }
    Path.setPath(linkToSelect?.urlPath || pathToDisplay, linkToSelect, options); // before link.select because selection cache by current URL
    Link.persistLinkSelection(linkToSelect); // if null, persists deselect or paragraph scroll
    Link.updateSelectionClass(linkToSelect || pathToDisplay.parentLink); // if null, removes previous selection's class
    let header = setHeader(pathToDisplay.firstTopicPath.firstTopic, options);
    document.title = pathToDisplay.pageTitle;

    displayPathTo(pathToDisplay.paragraph, options);
    pathToDisplay.paragraphs.forEach(p => p.executePreDisplayCallbacks());
    if (options.scrollStyle !== 'instant') pathToDisplay.paragraphs.forEach(p => p.display());
    Link.eagerLoadVisibleLinks();

    return afterChangeScroll(pathToDisplay, linkToSelect, options)
      .then(() => options.scrollStyle === 'instant' && pathToDisplay.paragraphs.forEach(p => p.display()))
      .then(() => header.show())
      .then(() => pathToDisplay.paragraph.addSelectionClass()); // last for feature specs
  }).finally(() => Paragraph.disableDisplayInProgress());
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
