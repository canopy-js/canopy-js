import Path from 'models/path';
import Link from 'models/link';
import updateView from 'display/update_view';
import {
  setHeader,
  tryPathPrefix,
  resetDom,
  scrollPage,
} from 'display/helpers';

const displayPath = (pathToDisplay, linkToSelect, displayOptions) => {
  displayOptions = displayOptions || {};
  if (!pathToDisplay.paragraph) return tryPathPrefix(pathToDisplay, displayOptions);
  try { linkToSelect?.element } catch { return updateView(pathToDisplay, null, displayOptions); }
  if (linkToSelect?.contradicts(pathToDisplay)) {
    return updateView(linkToSelect.paragraphPathWhenSelected, linkToSelect, displayOptions);
  }

  resetDom();
  Path.setPath(linkToSelect?.urlPathWhenSelected || pathToDisplay);
  setHeader(pathToDisplay.rootTopicPath.topic);
  document.title = pathToDisplay.rootTopicPath.paragraph.topic.mixedCase;
  Link.select(linkToSelect); // if null, persists deselect

  pathToDisplay.paragraph.select();
  displayPathTo(pathToDisplay.paragraph);
  scrollPage(displayOptions);
};

const displayPathTo = (paragraph) => {
  paragraph.display();
  if (paragraph.isPageRoot) return;
  paragraph.parentLink && paragraph.parentLinks.forEach(link => link.open());
  paragraph.ancestorImportReferences.forEach(link => link.open());
  if (paragraph.parentLink && !Link.selection) Link.select(paragraph.parentLink);
  displayPathTo(paragraph.parentParagraph);
}

export default displayPath;
