function renderStyledText(text) {
  let buffer = '';
  let escaped = false;
  let styles = {
    B: false,
    I: false,
    S: false,
    CODE: false
  };

  let stylesByText = {
    '_': 'I',
    '*': 'B',
    '~': 'S',
    '`': 'CODE'
  }

  let elements = [];

  for (let i = 0; i < text.length; i++) {
    if (!escaped && ['_', '*', '~', '`'].includes(text[i])) {
      let textNode = document.createTextNode(buffer);
      buffer = '';
      let styleElementHead;
      let styleElementTail;

      Object.keys(styles).forEach(function(styleKey) {
        if (styles[styleKey]) {
          let element = document.createElement(styleKey);
          styleElementTail && styleElementTail.appendChild(element);
          styleElementHead = styleElementHead || element;
          styleElementTail = element;
        }
      });

      if (styleElementTail) {
        styleElementTail.appendChild(textNode);
        elements.push(styleElementHead);
      } else {
        elements.push(textNode);
      }
      styles[stylesByText[text[i]]] = !styles[stylesByText[text[i]].toUpperCase()];
    } else if (!escaped && text[i] === '\\') {
      escaped = true;
    } else {
      buffer += text[i];
      escaped = false;
    }
  }

  if (buffer) {
    let textNode = document.createTextNode(buffer);
    elements.push(textNode);
  }

  return elements;
}

export default renderStyledText;
