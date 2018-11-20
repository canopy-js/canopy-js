import parsePathString from 'path/parse_path_array';
import displayPath from 'display/display_path';
import renderTopic from 'render/render_topic';

const onParentLinkClick = (topicName, linkElement, targetSubtopic) => {
  return (e) => {
    e.preventDefault();
    // If the link's child is already selected, display the link's section

    var pathArray = parsePathString();
    var finalTuple = pathArray.pop();

    if (linkElement.classList.contains('canopy-open-link')) {
      var newTuple = [linkElement.dataset.enclosingTopic, linkElement.dataset.enclosingSubtopic];
      pathArray.push(newTuple);

      displayPath(pathArray);
    } else {
      var newTuple = [topicName, targetSubtopic];
      pathArray.push(newTuple);

      displayPath(pathArray);
    }
  }
}

const onGlobalLinkClick = (targetTopic, targetSubtopic) => {
  return (e) => {
    e.preventDefault();
    renderTopic(
      [[targetTopic, targetSubtopic]]
    );
  }
}

export { onParentLinkClick, onGlobalLinkClick };
