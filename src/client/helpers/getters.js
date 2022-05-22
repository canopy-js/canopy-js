import Link from 'models/link';

const canopyContainer = document.getElementById('_canopy');

const defaultTopic = canopyContainer && canopyContainer.dataset.defaultTopic;

const projectPathPrefix = canopyContainer && canopyContainer.dataset.projectPathPrefix;

function ancestorElement(currentElement, className) {
  let parentElement = currentElement.parentElement;
  while (parentElement.classList && !parentElement.classList.contains(className)) {
    parentElement = parentElement.parentNode;
    if (parentElement === canopyContainer) return null;
  }
  return parentElement;
}

export {
  canopyContainer,
  defaultTopic,
  projectPathPrefix,
  ancestorElement
};
