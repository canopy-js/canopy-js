import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';
import updateView from 'display/update_view';
import {
  setHeader,
  tryPathPrefix,
  resetDom,
  scrollPage,
  animatePathChange
} from 'display/helpers';

import { canopyContainer } from 'helpers/getters';

function displayPath(pathToDisplay, linkToSelect, options = {}) {
  if (!linkToSelect) linkToSelect = pathToDisplay.paragraph?.parentLink; // always select link?
  if (Path.shouldAnimate(pathToDisplay, linkToSelect, options)) return animatePathChange(pathToDisplay, linkToSelect, options);
  if (linkToSelect && !pathToDisplay.includes(linkToSelect.enclosingPath)) throw 'linkToSelect argument is not on given pathToDisplay';
  if (!pathToDisplay.paragraph) return tryPathPrefix(pathToDisplay, options);
  try { linkToSelect?.element } catch { return updateView(pathToDisplay, null, options); }
  if (linkToSelect?.isCycle) updateView(linkToSelect.inlinePath, null, {renderOnly: true}); // invisibly render child paragraphs

  Path.setPath(linkToSelect?.urlPath || pathToDisplay, options); // must be done before link.select because selection cache is by current URL
  Link.updateSelectionClass(linkToSelect); // if null, removes previous selection's class
  Link.persistSelection(linkToSelect); // if null, persists deselect
  if (options.noDisplay) return;

  resetDom();
  let header = setHeader(pathToDisplay.rootTopicPath.topic, options);

  let visibleParagraphs = displayPathTo(pathToDisplay.paragraph, [], options);
  pathToDisplay.paragraph.addSelectionClass();
  setTimeout(() => visibleParagraphs.forEach(paragraph => paragraph.display()) || header.show());
  return !options.noScroll ? Promise.resolve : scrollPage(linkToSelect, options);
};

const displayPathTo = (paragraph, visibleParagraphs, options) => {
  options.scrollStyle === 'instant' ? paragraph.allocateSpace() : paragraph.display(); // scroll to correct location before showing content
  visibleParagraphs.push(paragraph);
  if (paragraph.isroot) return visibleParagraphs;
  if (paragraph.parentLink) { paragraph.parentLink?.open(); Link.persistLastLinkSelection(paragraph.parentLink); } // remember open links of path reference
  Link.persistLastLinkSelection(paragraph.parentLink); // being an open link makes that link the most recently selected for its paragraph
  return displayPathTo(paragraph.parentParagraph, visibleParagraphs, options);
}

export default displayPath;
