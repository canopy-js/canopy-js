function renderBoldText(token, renderContext, renderTokenElements) {
  let element = document.createElement('B');
  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => element.appendChild(subtokenElement));
  });
  return [element];
}

function renderUnderlineText(token, renderContext, renderTokenElements) {
  let element = document.createElement('U');
  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => element.appendChild(subtokenElement));
  });
  return [element];
}

function renderItalicText(token, renderContext, renderTokenElements) {
  let element = document.createElement('I');
  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => element.appendChild(subtokenElement));
  });
  return [element];
}

export {
  renderBoldText,
  renderUnderlineText,
  renderItalicText
};
