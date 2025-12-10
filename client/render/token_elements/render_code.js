function renderCodeBlock(token) {
  let preElement = document.createElement('PRE');
  let codeBlockElement = document.createElement('CODE');
  preElement.appendChild(codeBlockElement);

  codeBlockElement.innerText = token.text;
  codeBlockElement.classList.add('canopy-code-block');

  return [preElement];
}

function renderInlineCodeText(token) {
  let element = document.createElement('CODE');
  element.innerText = token.text;
  return [element];
}

export {
  renderCodeBlock,
  renderInlineCodeText
};
