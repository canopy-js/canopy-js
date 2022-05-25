import Path from 'models/path';
import { canopyContainer } from 'helpers/getters';

import {
  setHeader,
  addSelectedLinkClass,
  tryPathPrefix,
  resetDom
} from 'display/helpers';

import Link from 'models/link';
import Paragraph from 'models/paragraph';

const displayPath = (pathToDisplay, linkToSelect, displayOptions) => {
  displayOptions = displayOptions || {};
  if (!pathToDisplay.paragraph) return tryPathPrefix(pathToDisplay, displayOptions);

  resetDom();

  if (!displayOptions.pathAlreadySet) Path.setPath(pathToDisplay);
  setHeader(Paragraph.root.displayTopicName);
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
