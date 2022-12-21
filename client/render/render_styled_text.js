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

  text = text.replace(/{{(OPEN|CLOSE).}}/g, (match) => match.split('').join('\\')); // Escape literal style tokens in user input

  // Single backslashes are an escape character in code snippets in order to allow escaping the backtick character.
  // Thus, we want to escape everything in the code snippet, but not in such a way that user-entered single backslashes get doubled and become literals.
  // First group - a backtick is only a special character if preceeded by whitepace, another special character, or wrapping punctuation
  text = text.replace(/(^|[\s_*`~"'([{}\]\)]+)([`])(.*?[^\\])(\2)(?=[\s.,{*_`~"'{[(\]})]|$)/g, (_, characterBeforeCodeBlock, backtick, block, backtick2) => {
    return characterBeforeCodeBlock
      + backtick
      + block // For each code block,
        .replace(/([^\\]|^)\\(?=[^\\]|$)/g, '$1') // remove all user-entered single backslashes from code snippet, or those added from previous line
        .replace(/\\\\/g, '\\') // replace user-entered double backslashes with single backslashes
        .split('').join('\\') // insert backslashes before all characters to treat code snippet as literal
      + backtick2;
  });

  text = (function convertStyleCharacters(text) {
    let newText = text.replace(/(^|[\s}_*`~"'{[(\]})]+)([*`_~])(.*?(?!{{CLOSE|{{OPEN|\\))(\2)(?=[\s.,{*_`~"'{[(\]})]|$)/g, '$1{{OPEN$2}}$3{{CLOSE$4}}')
    if (text === newText){
      return newText;
    } else {
      return convertStyleCharacters(newText);
    }
  })(text); // Do multiple sweeps of the string replacing valid style characters with tokens until none remain

  for (let i = 0; i < text.length; i++) {
    let openMatch = text.slice(i).match(/^{{OPEN(.)}}/);
    let closeMatch = text.slice(i).match(/^{{CLOSE(.)}}/);

    if (openMatch) { // We are at the first style character of a pair
      let styleCharacter = openMatch[1];
      if (buffer) {
        let textNode = document.createTextNode(buffer);
        buffer = '';
        styleParent ? styleParent.appendChild(textNode) : elements.push(textNode);
      }

      let styleElement = document.createElement(stylesByText[styleCharacter]);
      styleParent ? styleParent.appendChild(styleElement) : elements.push(styleElement);
      styleParent = styleElement;
      styleStack.push(styleCharacter);
      i += (openMatch[0].length - 1);

    } else if (closeMatch && styleStack.slice(-1)[0] === closeMatch[1]) { // this closing style character closes the most recent open one
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
      i += (closeMatch[0].length - 1);

    } else if (closeMatch && styleStack.slice(-1)[0] !== closeMatch[1]) { // this style character does not match the most recent one and is rejected
      buffer += closeMatch[1];
      i += (closeMatch[0].length - 1);

    } else if (!escaped && text[i] === '\\') { // handle escape character
      escaped = true;

    } else { // handle regular character
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
