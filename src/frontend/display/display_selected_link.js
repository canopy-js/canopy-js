import displayPath from 'display/display_path';
import { deselectAllLinks } from 'display/reset_page';
import { childSectionElementOfParentLink } from 'helpers/getters';
import { setPathAndFragment } from 'helpers/set_path_and_fragment';
import { sectionElementOfLink } from 'helpers/getters';
import { currentRootSection } from 'helpers/getters';


// Select link, triggering displayPath if it is a parent link
const displaySelectedLink = (linkElement) => {
  deselectAllLinks();
  removeLastSelectionClassFromCurrentTopic();

  linkElement.classList.add('canopy-selected-link');
  linkElement.classList.add('canopy-most-recently-selected-link-of-section');

  if (linkElement.classList.contains('canopy-parent-link')) {
    var childSectionElement = childSectionElementOfParentLink(linkElement);
    displayPath(
      childSectionElement.dataset.topicName,
      childSectionElement.dataset.subtopicName,
      linkElement
    );
  } else {
    displayPath(
      sectionElementOfLink(linkElement).dataset.topicName,
      sectionElementOfLink(linkElement).dataset.subtopicName,
      linkElement
    );
  }
}

function removeLastSelectionClassFromCurrentTopic(linkElement) {
  Array.from(currentRootSection().
    getElementsByClassName('canopy-most-recently-selected-link-of-section')).
    forEach((linkElement) => {
      linkElement.classList.remove('canopy-most-recently-selected-link-of-section');
    });
}

export default displaySelectedLink;
