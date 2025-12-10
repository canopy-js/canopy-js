import ScrollableContainer from 'helpers/scrollable_container';
import { scrollToWithPromise, getScrollInProgress } from 'display/helpers';
import Path from 'models/path';

function renderImage(token, renderContext, renderTokenElements) {
  // Outer container
  let outerDivElement = document.createElement('DIV');
  outerDivElement.classList.add('canopy-image-container');

  // Inner container (existing divElement)
  let innerDivElement = document.createElement('DIV');
  innerDivElement.classList.add('canopy-image');

  let imageElement = document.createElement('IMG');
  imageElement.setAttribute('src', token.resourceUrl);
  imageElement.setAttribute('decoding', 'async'); // don't wait for image decode to update selected link on change

  innerDivElement.appendChild(imageElement); // Append the image to the inner container

  if (token.title) {
    imageElement.setAttribute('title', token.title);
  }

  if (token.caption) {
    let spanElement = document.createElement('SPAN');
    spanElement.classList.add('canopy-image-caption');
    innerDivElement.appendChild(spanElement); // Append the caption to the inner container

    token.tokens.forEach(subtoken => {
      let subtokenElements = renderTokenElements(subtoken, renderContext);
      subtokenElements.forEach(subtokenElement => spanElement.appendChild(subtokenElement));
    });
  }

  if (token.altText) {
    imageElement.setAttribute('alt', token.altText);
  }

  handleDelayedImageLoad(imageElement, renderContext);

  outerDivElement.appendChild(innerDivElement); // Append the inner container to the outer container

  return [outerDivElement]; // Return the outer container
}

// we don't know how big the image will be, and don't want the load to disrupt viewport
function handleDelayedImageLoad(imageElement, renderContext) {
  let originalHeight = imageElement.style.height;
  let originalOpacity = imageElement.style.opacity;
  let originalWidth = imageElement.style.width;
  if (imageElement.closest('.canopy-image')) var originalContainerWidth = imageElement.closest('.canopy-image').style.width;

  imageElement.style.setProperty('height', ScrollableContainer.visibleHeight + 'px'); // big so that content changing doesn't cause flash
  imageElement.style.setProperty('width', '100%');
  imageElement.style.setProperty('opacity', '0');
  if (imageElement.closest('.canopy-image')) imageElement.closest('.canopy-image').style.setProperty('width', '100%');

  setTimeout(() => { // after 200 ms add gray box but not before then to avoid flash
    if (!imageElement.complete) (imageElement.closest('.canopy-image')||imageElement).style.setProperty('background-color', '#f5f5f5');
  }, 200);

  imageElement.addEventListener('load', () => { // if images were unloaded, scroll was delayed and so we do it now to avoid viewport jump
    (getScrollInProgress() || Promise.resolve()).then(() => { // if there is a scroll in progress, wait for it to complete.
      let focusedElement = ScrollableContainer.focusedElement;
      let oldBottomOfCurrentParagraph = focusedElement.getBoundingClientRect().bottom;

      imageElement.style.setProperty('height', originalHeight);
      imageElement.style.setProperty('width', originalWidth);
      imageElement.style.setProperty('opacity', originalOpacity);
      if (imageElement.closest('.canopy-image')) imageElement.closest('.canopy-image').style.setProperty('width', originalContainerWidth);

      imageElement.closest('.canopy-image')?.style.setProperty('background-color', 'transparent'); // remove gray placeholder
      let newBottomOfCurrentParagraph = focusedElement.getBoundingClientRect().bottom;
      let diff = newBottomOfCurrentParagraph - oldBottomOfCurrentParagraph;
      let newScroll = ScrollableContainer.currentScroll + diff;
      if (window.getComputedStyle(imageElement).display === 'absolute') return; // doesn't disrupt flow

      let { pathToParagraph } = renderContext;
      if (Path.current.includes(pathToParagraph)) { // if when the image loads, it is on the current page and might jump the viewport
        scrollToWithPromise({  // restore old position
          top: newScroll,
          behavior: 'instant'
        });
      }
    });
  });
}

export {
  renderImage,
  handleDelayedImageLoad
};
