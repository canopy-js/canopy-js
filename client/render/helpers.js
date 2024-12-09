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
  // Get computed font size and font family from the element
  const computedStyle = window.getComputedStyle(element);
  const fontSize = parseFloat(computedStyle.fontSize);
  const fontFamily = computedStyle.fontFamily;

  if (!fontSize || fontSize <= 0) {
    console.warn('Font size is invalid or zero.');
    return [0, 0];
  }

  // Get the text content and split it by lines
  const textLines = element.textContent.split('\n');

  // Create a canvas element for rendering
  const canvas = document.createElement('canvas');
  // Set the `willReadFrequently` option to true
  const context = canvas.getContext('2d', { willReadFrequently: true });

  // Set canvas width and height with extra space for any unusual characters
  canvas.width = fontSize * 10;
  canvas.height = fontSize * 3; // Triple the font size to ensure ample height
  context.font = `${fontSize}px ${fontFamily}`;
  context.textBaseline = 'alphabetic';

  // Measure bounds for the reference "()" characters
  function measureTextBounds(textContent) {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear any previous drawings
    context.fillText(textContent, 0, fontSize * 1.5); // Draw text centered vertically

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let top = null;
    let bottom = null;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = imageData[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          if (top === null) top = y;
          bottom = y;
          break;
        }
      }
    }
    return { top, bottom };
  }

  const referenceBounds = measureTextBounds('()');
  let maxSpaceAbove = 0;
  let maxSpaceBelow = 0;

  // Measure each line of text
  for (const line of textLines) {
    const textBounds = measureTextBounds(line);

    // Calculate differences relative to the reference
    const diffAbove = referenceBounds.top - textBounds.top;
    const diffBelow = textBounds.bottom - referenceBounds.bottom;

    // If there's a perfect fit (0 difference), add a 1 pixel buffer
    let spaceAbove = diffAbove; // line height forces minimum border so there's already a gap
    let spaceBelow = diffBelow > 0 ? diffBelow : (diffBelow === 0 ? 1 : 0);

    maxSpaceAbove = Math.max(maxSpaceAbove, spaceAbove);
    maxSpaceBelow = Math.max(maxSpaceBelow, spaceBelow);
  }

  return [maxSpaceAbove, maxSpaceBelow];
}

function whenInDom(element) {
  return function(callback) {
    if (!element) return console.error('whenInDom received falsey element argument');
    // Check if the element is already in the DOM
    if (document.body.contains(element)) {
      callback();
    } else {
      // Reschedule the check after a short delay if the element is not in the DOM
      setTimeout(() => whenInDom(element)(callback), 1);
    }
  };
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
    throw new Error("No visible elements found in the input array.");
  }

  // Calculate the width and height of the combined bounding box
  combinedRect.width = combinedRect.right - combinedRect.left;
  combinedRect.height = combinedRect.bottom - combinedRect.top;

  return combinedRect;
}

export { generateHeader, measureVerticalOverflow, whenInDom, getCombinedBoundingRect };
