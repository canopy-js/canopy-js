import Path from 'models/path';
import { canopyContainer } from 'helpers/getters';

import {
  setHeader,
  addSelectedLinkClass,
  hideAllSectionElements,
  deselectAllLinks,
  removeDfsClasses,
  tryPathPrefix
} from 'display/helpers';

import Link from 'models/link';

const displayPath = (pathToDisplay, linkToSelect, displayOptions) => {
  displayOptions = displayOptions || {};
  if (!pathToDisplay.paragraph) return tryPathPrefix(pathToDisplay, displayOptions);

  document.title = pathToDisplay.firstTopic;
  setHeader(pathToDisplay.firstSegment.paragraph.displayTopicName);

  resetDom();

  if (!displayOptions.pathAlreadySet) Path.setPath(pathToDisplay);
  if (linkToSelect) {
    Link.select(linkToSelect);
    Link.persistInHistory(linkToSelect);
    Link.persistInSession(linkToSelect);
  }

  displayPathTo(pathToDisplay.paragraph, linkToSelect);
  window.scrollTo(0, canopyContainer.scrollHeight);
};

const displayPathTo = (paragraph, link) => {
  paragraph.display();
  if (paragraph.isPageRoot) return;
  paragraph.parentLink && paragraph.parentLink.open();
  displayPathTo(paragraph.parentParagraph, link);
}

const resetDom = () => {
  deselectAllLinks();
  hideAllSectionElements();
}

export default displayPath;
