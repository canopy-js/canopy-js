import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';
import updateView from 'display/update_view';
import {
  setHeader,
  tryPathPrefix,
  resetDom,
  beforeChangeScroll,
  afterChangeScroll
} from 'display/helpers';

import { canopyContainer } from 'helpers/getters';

function displayPath(pathToDisplay, linkToSelect, options = {}) {
  if (!Paragraph.byPath(pathToDisplay)) return tryPathPrefix(pathToDisplay, options);
  beforeChangeScroll(pathToDisplay, linkToSelect, options).then(() => {  // eg long distance up or two-step path transition
    Paragraph.byPath(pathToDisplay).addToDom(); // add before reset so classes on DOM elements are removed
    resetDom(pathToDisplay);
    if (linkToSelect && !linkToSelect?.element) { linkToSelect?.eraseLinkData(); return updateView(pathToDisplay, null, options); }
    Path.setPath(linkToSelect?.urlPath || pathToDisplay, options); // before link.select because selection cache by current URL
    Link.persistLinkSelection(linkToSelect || pathToDisplay.parentLink); // if null, persists deselect
    Link.updateSelectionClass(linkToSelect || pathToDisplay.parentLink); // if null, removes previous selection's class
    let header = setHeader(pathToDisplay.rootTopicPath.topic, options);
    document.title = pathToDisplay.lastTopic.mixedCase;

    let visibleParagraphs = displayPathTo(pathToDisplay.paragraph, options);
    pathToDisplay.paragraph.addSelectionClass();
    setTimeout(() => Link.visible.filter(link => link.isGlobal).forEach(link => setTimeout(() => link.execute({ renderOnly: true })))); // eager render
    return afterChangeScroll(pathToDisplay, linkToSelect, options).then(() => {
      visibleParagraphs.forEach(paragraph => paragraph.display()) || header.show();
    });
  });
};

const displayPathTo = (paragraph, options) => {
  let visibleParagraphs = [];

  while (paragraph) {
    options.scrollStyle === 'instant' ? paragraph.allocateSpace() : paragraph.display(); // scroll to correct location before showing content
    visibleParagraphs.push(paragraph);
    if (paragraph.parentLink) paragraph.parentLink?.open(); // remember open links of path reference
    Link.persistLinkSelectionInSession(paragraph.parentLink); // being an open link makes that link the most recently selected for its paragraph
    paragraph = paragraph.parentParagraph;
  }

  return visibleParagraphs;
}

export default displayPath;
