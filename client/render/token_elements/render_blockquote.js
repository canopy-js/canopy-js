import { canopyContainer } from 'helpers/getters';

function renderBlockQuote(token, renderContext, renderTokenElements) {
  let blockQuoteElement = document.createElement('BLOCKQUOTE');
  blockQuoteElement.setAttribute('dir', token.direction);

  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => blockQuoteElement.appendChild(subtokenElement));
  });

  // Clone blockQuoteElement for manipulation
  let clone = blockQuoteElement.cloneNode(true);

  // Convert all text nodes in the clone to single character spans
  function wrapEachLetterInSpan(element) {
    [...element.querySelectorAll('*')].forEach(parentElement => {
      [...parentElement.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.length > 1) {
          const text = node.textContent;
          const parent = node.parentNode;
          const fragment = document.createDocumentFragment();
          for (let char of text) {
            const span = document.createElement('span');
            span.classList.add('canopy-blockquote-character');
            span.textContent = char;
            fragment.appendChild(span);
          }

          parent.replaceChild(fragment, node);
        }
      });
    });
  }

  wrapEachLetterInSpan(clone);

  let tempSectionElement = new DOMParser().parseFromString('<section class="canopy-section"><p class="canopy-paragraph"></p></section>', 'text/html').body.firstChild;
  let tempParagraphElement = tempSectionElement.querySelector('p');
  canopyContainer.appendChild(tempSectionElement);
  tempParagraphElement.appendChild(clone);

  // Check direction consistency among characters in the clone
  let wraps = false;
  let direction = null; // neutral

  [...clone.querySelectorAll('span.canopy-blockquote-character,span.canopy-linebreak-span')].forEach((element, index, elements) => {
    if (element.classList.contains('canopy-linebreak-span')) { // we switched spans ie linebreak
      direction = null;
    } else { // The element is a character span
      let elementRect = element.getBoundingClientRect();
      let previousElement = elements[index - 1];
      let previousRect = elements[index - 1]?.getBoundingClientRect();

      let previousElementWasNewline = previousElement && (previousElement?.classList.contains('canopy-linebreak-span') 
        || previousElement.tagName === "BR" || previousElement.innerText === '\n');
      
      if (previousElement && !previousElementWasNewline) {  // don't compare first letter to last of last line
        if (direction === null) {
          direction = elementRect.right > previousRect.right ? 1 : -1;
        } else {
          wraps = wraps || (elementRect.right > previousRect.right ? 1 : -1) !== direction; // direction is not the same
        }
      }
    }
  });

  // Remove clone from DOM after measurement
  tempParagraphElement.removeChild(clone);

  if (wraps) {
    blockQuoteElement.querySelectorAll('.canopy-linebreak-span').forEach((span) => {
      span.classList.add('canopy-blockquote-padded-linebreak'); // there is no terminal linebreak so we pad all
    });
  }

  tempSectionElement.remove();

  return [blockQuoteElement];
}

export default renderBlockQuote;
