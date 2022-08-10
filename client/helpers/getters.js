import Link from 'models/link';

const canopyContainer = document.getElementById('_canopy');

const defaultTopic = canopyContainer && canopyContainer.dataset.defaultTopic;

const projectPathPrefix = canopyContainer && canopyContainer.dataset.projectPathPrefix;

const hashUrls = canopyContainer && canopyContainer.dataset.hashUrls;

function getAncestorElement(currentElement, className) {
  let parentElement = currentElement.parentElement;
  while (parentElement.classList && !parentElement.classList.contains(className)) {
    if (parentElement === canopyContainer) return null;
    parentElement = parentElement.parentNode;
  }
  return parentElement;
}

export {
  canopyContainer,
  defaultTopic,
  projectPathPrefix,
  hashUrls,
  getAncestorElement
};
