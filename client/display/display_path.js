import Path from 'models/path';
import { canopyContainer } from 'helpers/getters';
import Link from 'models/link';
import Paragraph from 'models/paragraph';
import updateView from 'display/update_view';
import {
  setHeader,
  addSelectedLinkClass,
  tryPathPrefix,
  resetDom,
  pathForUrl,
  scrollPage
} from 'display/helpers';

const displayPath = (pathToDisplay, linkToSelect, displayOptions) => {
  displayOptions = displayOptions || {};
  if (!pathToDisplay.paragraph) return tryPathPrefix(pathToDisplay, displayOptions);
  if (linkToSelect?.contradicts(pathToDisplay)) {
    return updateView(linkToSelect.pathToDisplay, linkToSelect, displayOptions);
  }

  resetDom();
  if (!displayOptions.pathAlreadySet) Path.setPath(pathForUrl(pathToDisplay, linkToSelect));
  setHeader(Paragraph.pageRoot.displayTopicName);
  document.title = pathToDisplay.firstTopic;
  Link.select(linkToSelect); // if null, persists deselect

  pathToDisplay.paragraph.select();
  displayPathTo(pathToDisplay.paragraph);
  if (linkToSelect) scrollPage();
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
