import json from '../../package.json';

let canopyContainer = document.getElementById('_canopy');
if (!canopyContainer) throw new Error('Page must contain an element with id #_canopy');

canopyContainer.dataset.canopyVersion = json.version;

let defaultTopic = () => canopyContainer && canopyContainer.dataset.defaultTopic;

let defaultTopicJson = () => canopyContainer && document.getElementById('canopy_default_topic_json')?.textContent;

let projectPathPrefix = canopyContainer && canopyContainer.dataset.projectPathPrefix;

let hashUrls = canopyContainer && canopyContainer.dataset.hashUrls;

export {
  canopyContainer,
  defaultTopic,
  defaultTopicJson,
  projectPathPrefix,
  hashUrls
};
