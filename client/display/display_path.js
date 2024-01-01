import Path from 'models/path';
import Link from 'models/link';
import updateView from 'display/update_view';
import {
  setHeader,
  tryPathPrefix,
  resetDom,
  scrollPage,
  animatePathChange
} from 'display/helpers';
import BackButton from 'render/back_button';
import { canopyContainer } from 'helpers/getters';

function displayPath(pathToDisplay, linkToSelect, options) {
  options = options || {};

  if (Path.animate(pathToDisplay, options)) return animatePathChange(pathToDisplay, options);
  if (linkToSelect && !pathToDisplay.includes(linkToSelect.enclosingPath)) throw 'linkToSelect argument is not on given pathToDisplay';
  if (!pathToDisplay.paragraph) return tryPathPrefix(pathToDisplay, options);
  try { linkToSelect?.element } catch { return updateView(pathToDisplay, null, options); }
  if (linkToSelect?.isCycle) updateView(linkToSelect.inlinePath, null, {noDisplay: true}); // invisibly render child paragraphs
  if (!linkToSelect) linkToSelect = pathToDisplay.paragraph.parentLink; // always select link?

  resetDom();
  let header = setHeader(pathToDisplay.rootTopicPath.topic, options);
  document.title = pathToDisplay.rootTopicPath.paragraph.topic.mixedCase;
  if (!options.noHistory) Path.setPath(linkToSelect?.urlPath || pathToDisplay); // must be done before link.select because selection cache is by current URL
  Link.updateSelectionClass(linkToSelect); // if null, removes previous selection's class
  Link.persistSelection(linkToSelect); // if null, persists deselect

  let visibleParagraphs = displayPathTo(pathToDisplay.paragraph, [], options);
  pathToDisplay.paragraph.addSelectionClass();
  if (!options.noScroll) scrollPage(linkToSelect, options);
  setTimeout(() => visibleParagraphs.forEach(paragraph => paragraph.display()) || header.show());
  BackButton.handlePathChange(options);
};

const displayPathTo = (paragraph, visibleParagraphs, options) => {
  if (options.scrollStyle === 'instant') {
    paragraph.allocateSpace();
  } else {
    paragraph.display();
  }
  visibleParagraphs.push(paragraph);
  if (paragraph.isPageRoot) return visibleParagraphs;
  paragraph.parentLink && paragraph.parentLinks.forEach(link => link.open());
  paragraph.ancestorImportReferences.forEach(link => link.open());
  return displayPathTo(paragraph.parentParagraph, visibleParagraphs, options);
}

export default displayPath;
