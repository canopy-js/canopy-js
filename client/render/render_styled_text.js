function renderStyledText(text) {
  let buffer = '';
  let escaped = false;

  let styleStack = [];

  let stylesByText = {
    '_': 'I',
    '*': 'B',
    '~': 'S',
    '`': 'CODE'
  }

  let elements = [];
  let styleParent;

  for (let i = 0; i < text.length; i++) {
    let openMatch = text.slice(i).match(/^([^_`*~A-Za-z]*)([_`*~]).*\2(?:\W+|$)/); // eg (_abc_)
    let closeMatch = text.slice(i).match(/^([_`*~])(?:[^_`*~A-Za-z]+|$)/); // eg _)
    let closeStyle = closeMatch && styleStack.slice(-1)[0] === closeMatch[1];

    if (!escaped && styleStack[0] !== '`' && openMatch) { // we ignore further characters within ` blocks
      let [_, pretext, styleCharacter] = openMatch;

      if (buffer) {
        let textNode = document.createTextNode(buffer);
        buffer = '';
        if (styleParent) {
          styleParent.appendChild(textNode);
        } else {
          elements.push(textNode);
        }
      }

      let styleElement = document.createElement(stylesByText[styleCharacter]);
      if (styleParent) {
        styleParent.appendChild(styleElement);
      } else {
        elements.push(styleElement);
      }
      styleParent = styleElement;
      styleStack.push(styleCharacter);
    } else if (closeStyle) {
      if (buffer) {
        let textNode = document.createTextNode(buffer);
        buffer = '';
        if (styleParent) {
          styleParent.appendChild(textNode);
        } else {
          elements.push(textNode);
        }
      }
      styleParent = styleParent.parentNode || null;
      styleStack.pop();
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
