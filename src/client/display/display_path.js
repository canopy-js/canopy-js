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

const displayPath = (path, displayOptions) => {
  displayOptions = displayOptions || {};
  if (!path.paragraph) return tryPathPrefix(path, displayOptions);

  document.title = path.firstTopic;
  setHeader(path.firstSegment.paragraph.displayTopicName);
  displayOptions.postDisplayCallback && displayOptions.postDisplayCallback();

  resetDom();

  let { linkToSelect, selectALink } = displayOptions;
  linkToSelect = determineLinkToSelect(linkToSelect, selectALink, path.paragraph);
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

function determineLinkToSelect(linkToSelect, selectALink, paragraph) {
  if (linkToSelect) return linkToSelect;
  if (selectALink) return paragraph.firstLink || paragraph.parentLink;
  return null;
}

const resetDom = () => {
  removeDfsClasses();
  deselectAllLinks();
  hideAllSectionElements();
}

export default displayPath;
