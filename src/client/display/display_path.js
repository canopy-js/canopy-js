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
  pathForUrl
} from 'display/helpers';

const displayPath = (pathToDisplay, linkToSelect, displayOptions) => {
  displayOptions = displayOptions || {};
  if (!pathToDisplay.paragraph) return tryPathPrefix(pathToDisplay, displayOptions);
  if (linkToSelect && linkToSelect.contradicts(pathToDisplay)) {
    return updateView(linkToSelect.pathToDisplay, linkToSelect, displayOptions);
  }

  resetDom();
  if (!displayOptions.pathAlreadySet) Path.setPath(pathForUrl(pathToDisplay, linkToSelect));
  setHeader(Paragraph.pageRoot.displayTopicName);
  document.title = pathToDisplay.firstTopic;
  Link.select(linkToSelect); // if null, persists deselect

  displayPathTo(pathToDisplay.paragraph, linkToSelect);
  window.scrollTo(0, canopyContainer.scrollHeight);
};

const displayPathTo = (paragraph) => {
  paragraph.display();
  if (paragraph.isPageRoot) return;
  paragraph.parentLink && paragraph.parentLink.open();
  displayPathTo(paragraph.parentParagraph);
}

export default displayPath;
