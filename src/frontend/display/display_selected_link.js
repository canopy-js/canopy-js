import displaySubtopic from 'display/display_subtopic';
import { deselectAllLinks } from 'display/reset_page';
import { childSectionElementOfParentLink } from 'helpers/getters';
import { setPathAndFragment } from 'helpers/set_path_and_fragment';
import { sectionElementOfLink } from 'helpers/getters';

// Select link, triggering displaySubtopic if it is a parent link
const displaySelectedLink = (linkElement) => {
  deselectAllLinks();
  linkElement.classList.add('canopy-selected-link');
  if (linkElement.classList.contains('canopy-parent-link')) {
    var childSectionElement = childSectionElementOfParentLink(linkElement);
    displaySubtopic(
      childSectionElement.dataset.topicName,
      childSectionElement.dataset.subtopicName,
      linkElement
    );
  } else {
    displaySubtopic(
      sectionElementOfLink(linkElement).dataset.topicName,
      sectionElementOfLink(linkElement).dataset.subtopicName,
      linkElement
    );
  }
}

export default displaySelectedLink;
