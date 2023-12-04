import Path from 'models/path';
import Link from 'models/link';
import updateView from 'display/update_view';
import {
  setHeader,
  tryPathPrefix,
  resetDom,
  scrollPage,
} from 'display/helpers';
import BackButton from 'render/back_button';
import { canopyContainer } from 'helpers/getters';

function displayPath (pathToDisplay, linkToSelect, options) {
  options = options || {};

  if (!pathToDisplay.paragraph) return tryPathPrefix(pathToDisplay, options);
  try { linkToSelect?.element } catch { return updateView(pathToDisplay, null, options); }
  if (!pathToDisplay.paragraph.pageRoot && !linkToSelect) linkToSelect = pathToDisplay.paragraph.parentLink;
  if (linkToSelect?.contradicts(pathToDisplay)) return updateView(linkToSelect.path, linkToSelect, options);

  resetDom();
  let header = setHeader(pathToDisplay.rootTopicPath.topic, options);
  document.title = pathToDisplay.rootTopicPath.paragraph.topic.mixedCase;
  Path.setPath(linkToSelect?.path || pathToDisplay); // must be done before link.select because selection cache is by current URL
  Link.select(linkToSelect); // if null, persists deselect

  let visibleParagraphs = displayPathTo(pathToDisplay.paragraph, [], options);
  pathToDisplay.paragraph.select();
  if (!options.noScroll) scrollPage(linkToSelect, options);
  setTimeout(() => visibleParagraphs.forEach(paragraph => paragraph.display()) || header.show());
  BackButton.handlePathChange(options.initialLoad);
};

const displayPathTo = (paragraph, visibleParagraphs, options) => {
  if (options.scrollStyle === 'auto') {
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
