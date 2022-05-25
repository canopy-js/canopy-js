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

const displayPath = (path, linkToSelect, displayOptions) => {
  displayOptions = displayOptions || {};
  if (!path.paragraph) return tryPathPrefix(path, displayOptions);

  document.title = path.firstTopic;
  setHeader(path.firstSegment.paragraph.displayTopicName);
  displayOptions.postDisplayCallback && displayOptions.postDisplayCallback();

  resetDom();

  if (!displayOptions.pathAlreadySet) Path.setPath(path);
  if (linkToSelect) {
    Link.select(linkToSelect);
    Link.persistInHistory(linkToSelect);
    Link.persistInSession(linkToSelect);
  }

  displayPathTo(path.paragraph, linkToSelect);
  window.scrollTo(0, canopyContainer.scrollHeight);
};

const displayPathTo = (paragraph, link) => {
  paragraph.display();
  if (paragraph.isPageRoot) return;
  paragraph.parentLink && paragraph.parentLink.open();
  displayPathTo(paragraph.parentParagraph, link);
}

const resetDom = () => {
  removeDfsClasses();
  deselectAllLinks();
  hideAllSectionElements();
}

export default displayPath;
