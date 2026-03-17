function renderBlockQuote(token, renderContext, renderTokenElements) {
  let blockQuoteElement = document.createElement('BLOCKQUOTE');
  blockQuoteElement.setAttribute('dir', token.direction);

  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => blockQuoteElement.appendChild(subtokenElement));
  });

  const preDisplayBlockQuoteWrapDetection = () => {
    // Convert all text nodes to single character spans for measurement
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

    // Clone and attach for measurement, using the real DOM structure
    const clone = blockQuoteElement.cloneNode(true);
    blockQuoteElement.parentNode?.appendChild(clone);
    wrapEachLetterInSpan(clone);

    // Detect soft-wrap by checking whether any explicit line segment spans multiple visual rows.
    let wraps = false;
    const lineTolerance = 1;
    const segmentChars = [];

    function segmentWraps(chars) {
      if (chars.length < 2) return false;

      const nonLinkChars = chars.filter(char => !char.closest('a.canopy-selectable-link, a.canopy-disabled-link'));
      const effectiveChars = nonLinkChars.length ? nonLinkChars : chars; // preserve behavior for link-only segments
      if (effectiveChars.length < 2) return false;

      const firstTop = effectiveChars[0].getBoundingClientRect().top;
      return effectiveChars.some(char => Math.abs(char.getBoundingClientRect().top - firstTop) > lineTolerance);
    }

    [...clone.querySelectorAll('span.canopy-blockquote-character,span.canopy-linebreak-span')].forEach((element) => {
      if (element.classList.contains('canopy-linebreak-span')) {
        wraps = wraps || segmentWraps(segmentChars);
        segmentChars.length = 0;
        return;
      }

      segmentChars.push(element);
    });

    wraps = wraps || segmentWraps(segmentChars);

    if (wraps) {
      blockQuoteElement.querySelectorAll('.canopy-linebreak-span').forEach((span) => {
        span.classList.add('canopy-blockquote-padded-linebreak'); // there is no terminal linebreak so we pad all
      });
    }

    clone.remove();
  };
  renderContext.preDisplayCallbacks.push(preDisplayBlockQuoteWrapDetection);

  return [blockQuoteElement];
}

export default renderBlockQuote;
