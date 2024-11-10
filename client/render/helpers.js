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

  const referenceBounds = measureTextBounds('()'); // tall but line-fitting characters as benchmark to detect overflow
  let maxSpaceAbove = 0;
  let maxSpaceBelow = 0;

  // Measure each line of text
  for (const line of textLines) {
    const textBounds = measureTextBounds(line);

    const spaceAbove = referenceBounds.top - textBounds.top > 0 ? referenceBounds.top - textBounds.top : 0;
    const spaceBelow = textBounds.bottom - referenceBounds.bottom > 0 ? textBounds.bottom - referenceBounds.bottom : 0;

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

export { generateHeader, measureVerticalOverflow, whenInDom };
