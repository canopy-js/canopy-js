import renderTopic from 'render/render_topic';
import displayPathTo from 'display/display_path_to';
import setPathAndFragment from 'helpers/set_path_and_fragment';
import { sectionElementOfTopic } from 'helpers/getters';

const displayTopic = (topicName, subtopicName) => {
  if (true) { // check if the thing needs to be rendered
    renderTopic(topicName);
  }

  setPathAndFragment(topicName, subtopicName);
  const selectedElement = sectionElementOfTopic(topicName, subtopicName);
  displayPathTo(selectedElement);
}

export default displayTopic;
