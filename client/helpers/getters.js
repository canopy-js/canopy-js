import json from '../../package.json';

const canopyContainer = document.getElementById('_canopy');

canopyContainer.dataset.canopyVersion = json.version;

const defaultTopic = canopyContainer && canopyContainer.dataset.defaultTopic;

const projectPathPrefix = canopyContainer && canopyContainer.dataset.projectPathPrefix;

const hashUrls = canopyContainer && canopyContainer.dataset.hashUrls;

export {
  canopyContainer,
  defaultTopic,
  projectPathPrefix,
  hashUrls
};
