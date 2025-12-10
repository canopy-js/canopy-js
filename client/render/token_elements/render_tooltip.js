function renderToolTip(token, renderContext, renderTokenElements) {
  let tooltipContainerSpan = document.createElement('span');
  tooltipContainerSpan.className = 'canopy-tooltip';

  let tooltipIcon = document.createElement('sup');
  tooltipIcon.textContent = 'ⓘ';
  tooltipIcon.classList.add('canopy-tooltip-icon');
  tooltipContainerSpan.appendChild(tooltipIcon);

  let tooltipTextSpan = document.createElement('span');
  tooltipTextSpan.className = 'canopy-tooltiptext';
  tooltipTextSpan.dir = 'auto';
  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => tooltipTextSpan.appendChild(subtokenElement));
  });

  tooltipContainerSpan.appendChild(tooltipTextSpan);
  return [tooltipContainerSpan];
}

export default renderToolTip;
