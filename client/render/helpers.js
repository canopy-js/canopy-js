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
  const fontFamily = computedStyle.fontFamily;

  if (!fontSize || fontSize <= 0) {
    console.warn('Font size is invalid or zero.');
    return [0, 0];
  }

  const textLines = element.textContent.split('\n');

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  // Make the canvas large enough to draw text and measure accurately
  canvas.width = Math.ceil(fontSize * 20);
  canvas.height = Math.ceil(fontSize * 6);

  // Use a stable baseline by placing the text in the vertical middle of the canvas
  const baselineY = Math.floor(canvas.height / 2);

  context.font = `${fontSize}px ${fontFamily}`;
  context.textBaseline = 'alphabetic';

  // Use a reference text that covers ascenders, descenders, and typical heights 
  // to establish a stable top and bottom baseline
  const referenceText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  
  function measureTextBounds(textContent) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(textContent, 0, baselineY);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let top = null;
    let bottom = null;

    // Scan the imageData to find the topmost and bottommost pixels
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = imageData[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          if (top === null) top = y;
          bottom = y;
        }
      }
    }

    return { top, bottom };
  }

  // Measure the reference bounds, which should fully represent the font's vertical extents
  const referenceBounds = measureTextBounds(referenceText);
  if (referenceBounds.top === null || referenceBounds.bottom === null) {
    // If we somehow didn't get any pixels, return no overflow
    return [0, 0];
  }

  let maxDiffAbove = Number.NEGATIVE_INFINITY;
  let maxDiffBelow = Number.NEGATIVE_INFINITY;

  for (const line of textLines) {
    // If the line is empty, just skip it
    if (!line.trim()) continue;

    const textBounds = measureTextBounds(line);

    if (textBounds.top === null || textBounds.bottom === null) {
      // If this line didn't produce visible pixels (e.g., whitespace), skip it
      continue;
    }

    // Calculate how much higher the line's top is compared to reference top
    // If textBounds.top < referenceBounds.top, that means it extends above the reference top
    // diffAbove = referenceBounds.top - textBounds.top
    const diffAbove = referenceBounds.top - textBounds.top;

    // Calculate how much lower the line's bottom is compared to reference bottom
    // If textBounds.bottom > referenceBounds.bottom, that means it extends below the reference bottom
    // diffBelow = textBounds.bottom - referenceBounds.bottom
    const diffBelow = textBounds.bottom - referenceBounds.bottom;

    if (diffAbove > 0) {
      maxDiffAbove = Math.max(maxDiffAbove, diffAbove);
    }

    if (diffBelow > 0) {
      maxDiffBelow = Math.max(maxDiffBelow, diffBelow);
    }
  }

  if (maxDiffAbove === Number.NEGATIVE_INFINITY) maxDiffAbove = -1;
  if (maxDiffBelow === Number.NEGATIVE_INFINITY) maxDiffBelow = -1;

  // If flush or overflow, add padding
  // diff >= 0 means it extends beyond
  // If diff > 0, add diff + 1
  // If diff == 0, add just 1 pixel
  const spaceAbove = maxDiffAbove >= 0 ? (maxDiffAbove > 0 ? maxDiffAbove + 1 : 1) : 0;
  const spaceBelow = maxDiffBelow >= 0 ? (maxDiffBelow > 0 ? maxDiffBelow + 1 : 1) : 0;

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
