import Topic from '../../cli/shared/topic';
import renderTokenElements from './render_token_element';

function generateHeader(topicTokens, displayTopicName) {
  let topic = new Topic(displayTopicName);

  let previousHeader = document.querySelector(`h1[data-topic-name="${topic.cssMixedCase}"]`);
  if (previousHeader) return previousHeader;

  let headerElement = document.createElement('h1');
  headerElement.dataset.topicName = topic.mixedCase;
  headerElement.style.display = 'none';
  headerElement.classList.add('canopy-header');

  topicTokens.forEach(token => {
    let elements = renderTokenElements(token);
    elements.forEach(element => headerElement.appendChild(element));
  });

  return headerElement
}

function measureVerticalOverflow(element) {
  const computedStyle = window.getComputedStyle(element);
  const fontSize = parseFloat(computedStyle.fontSize);
  if (!fontSize) return [0, 0];

  const textLines = element.textContent.split('\n');

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = Math.ceil(fontSize * 20);
  canvas.height = Math.ceil(fontSize * 6);

  const baselineY = Math.floor(canvas.height / 2);

  const canvasFont =
    computedStyle.font ||
    `${computedStyle.fontStyle} ${computedStyle.fontVariant} ${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;

  context.font = canvasFont;
  context.textBaseline = 'alphabetic';

  function measureBounds(text) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(text, 0, baselineY);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let top = null;
    let bottom = null;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (data[(y * canvas.width + x) * 4 + 3]) {
          if (top === null) top = y;
          bottom = y;
        }
      }
    }
    return { top, bottom };
  }

  const referenceBounds = measureBounds('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
  if (referenceBounds.top == null) return [0, 0];

  let minimumTop = referenceBounds.top;
  let maximumBottom = referenceBounds.bottom;

  for (const line of textLines) {
    if (!line.trim()) continue;
    const bounds = measureBounds(line);
    if (bounds.top == null) continue;
    if (bounds.top < minimumTop) minimumTop = bounds.top;
    if (bounds.bottom > maximumBottom) maximumBottom = bounds.bottom;
  }

  const spaceAbove = Math.max(0, referenceBounds.top - minimumTop + 1);
  const spaceBelow = Math.max(0, maximumBottom - referenceBounds.bottom + 1);

  return [spaceAbove, spaceBelow];
}

function getCombinedBoundingRect(elements) {
  // Helper function to check if an element is visible and takes up space
  function isVisible(el) {
    const style = window.getComputedStyle(el);
    return (
      el.offsetWidth > 0 &&
      el.offsetHeight > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  }

  if (!Array.isArray(elements) || elements.length === 0) {
    throw new Error("The input should be a non-empty array of elements.");
  }

  // Initialize the combined rect with the bounds of the first visible element
  let combinedRect = null;

  elements.forEach(element => {
    // Get the bounding rect for the element and its visible children
    function getElementBoundingRect(el) {
      let rect = el.getBoundingClientRect();
      let currentCombinedRect = {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
      };

      // Process child elements recursively
      Array.from(el.children).forEach(child => {
        if (!isVisible(child)) return;

        let childRect = getElementBoundingRect(child);

        currentCombinedRect.top = Math.min(currentCombinedRect.top, childRect.top);
        currentCombinedRect.left = Math.min(currentCombinedRect.left, childRect.left);
        currentCombinedRect.bottom = Math.max(currentCombinedRect.bottom, childRect.bottom);
        currentCombinedRect.right = Math.max(currentCombinedRect.right, childRect.right);
      });

      return currentCombinedRect;
    }

    // Skip invisible elements
    if (!isVisible(element)) return;

    let elementRect = getElementBoundingRect(element);

    if (!combinedRect) {
      combinedRect = { ...elementRect };
    } else {
      combinedRect.top = Math.min(combinedRect.top, elementRect.top);
      combinedRect.left = Math.min(combinedRect.left, elementRect.left);
      combinedRect.bottom = Math.max(combinedRect.bottom, elementRect.bottom);
      combinedRect.right = Math.max(combinedRect.right, elementRect.right);
    }
  });

  if (!combinedRect) {
    return { top: 0, left: 0, bottom: 0, right: 0 };
  }

  // Calculate the width and height of the combined bounding box
  combinedRect.width = combinedRect.right - combinedRect.left;
  combinedRect.height = combinedRect.bottom - combinedRect.top;

  return combinedRect;
}

export { generateHeader, measureVerticalOverflow, getCombinedBoundingRect };
