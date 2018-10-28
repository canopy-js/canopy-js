import displaySubtopic from 'display/display_subtopic';
import { deselectAllLinks } from 'display/reset_page';
import { childSectionElementOfParentLink } from 'helpers/getters';

// Select link, triggering displaySubtopic if it is a parent link
const displaySelectedLink = (linkElement) => {
  deselectAllLinks();
  linkElement.classList.add('canopy-selected-link');
  if (linkElement.classList.contains('canopy-parent-link')) {
    var childSectionElement = childSectionElementOfParentLink(linkElement);
    displaySubtopic(
      childSectionElement.dataset.topicName,
      childSectionElement.dataset.subtopicName
    );
  }
}

export default displaySelectedLink;
