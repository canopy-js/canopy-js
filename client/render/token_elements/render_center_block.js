function renderCenterBlock(token, renderContext, renderTokenElements) {
  let container = document.createElement('div');
  container.className = 'canopy-center-block';
  container.style.textAlign = 'center';
  container.dir = 'auto';

  token.tokens.forEach(subtoken => {
    let elements = renderTokenElements(subtoken, renderContext);
    elements.forEach(el => container.appendChild(el));
  });

  return [container];
}

export default renderCenterBlock;
