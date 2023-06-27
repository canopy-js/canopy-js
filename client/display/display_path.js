import Path from 'models/path';
import Link from 'models/link';
import updateView from 'display/update_view';
import {
  setHeader,
  tryPathPrefix,
  resetDom,
  scrollPage,
} from 'display/helpers';

function displayPath (pathToDisplay, linkToSelect, displayOptions) {
  displayOptions = displayOptions || {};
  if (!pathToDisplay.paragraph) return tryPathPrefix(pathToDisplay, displayOptions);
  try { linkToSelect?.element } catch { return updateView(pathToDisplay, null, displayOptions); }
  if (!pathToDisplay.paragraph.pageRoot && !linkToSelect) linkToSelect = pathToDisplay.paragraph.parentLink;
  if (linkToSelect?.contradicts(pathToDisplay)) return updateView(linkToSelect.path, linkToSelect, displayOptions);

  resetDom();
  Path.setPath(linkToSelect?.path || pathToDisplay); // must be done before link.select because selection cache is by current URL
  setHeader(pathToDisplay.rootTopicPath.topic);
  document.title = pathToDisplay.rootTopicPath.paragraph.topic.mixedCase;
  Link.select(linkToSelect); // if null, persists deselect

  displayPathTo(pathToDisplay.paragraph);
  pathToDisplay.paragraph.select(); // putting this last gives browser tests a DOM change to wait on
  scrollPage(displayOptions);
};

const displayPathTo = (paragraph) => {
  paragraph.display();
  if (paragraph.isPageRoot) return;
  paragraph.parentLink && paragraph.parentLinks.forEach(link => link.open());
  paragraph.ancestorImportReferences.forEach(link => link.open());
  displayPathTo(paragraph.parentParagraph);
}

export default displayPath;
