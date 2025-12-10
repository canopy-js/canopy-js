import { handleDelayedImageLoad } from './render_image';

function renderHtmlElement(token, renderContext, renderTokenElements) {
  let divElement = document.createElement('DIV');
  divElement.classList.add('canopy-raw-html');

  let fragment = document.createRange().createContextualFragment(token.html); // make script tags functional
  divElement.appendChild(fragment);

  Array.from(divElement.querySelectorAll('.canopy-html-insertion')).forEach((placeholderDiv) => {
    let replacementIndex = placeholderDiv.dataset.replacementNumber;
    let tokens = token.tokenInsertions[replacementIndex];
    tokens.forEach(token => {
      let elements = renderTokenElements(token, renderContext);
      elements.forEach(element => placeholderDiv.appendChild(element));
    });
  });

  [...divElement.querySelectorAll('img')].forEach((imageElement) => { // if the html contains image tags that haven't loaded yet
    handleDelayedImageLoad(imageElement, renderContext);
  });

  return [divElement];
}

export default renderHtmlElement;
