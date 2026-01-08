function renderTextToken(token) {
  let spans = [];

  if (!token.text.includes('\n')) {
    let spanElement = document.createElement('SPAN');
    spanElement.classList.add('canopy-text-span');
    spanElement.innerText = token.text;
    return [spanElement];
  }

  const segments = token.text.split('\n');
  let cursor = 0;

  segments.forEach((textSegment, index) => {
    if (textSegment) {
      let spanElement = document.createElement('SPAN');
      spanElement.classList.add('canopy-text-span');

      spanElement.innerText = textSegment;
      spans.push(spanElement);
    }

    cursor += textSegment.length;

    if (index !== segments.length - 1) { // even if no text segment, insert linebreak
      let lineBreakSpan = document.createElement('SPAN');
      lineBreakSpan.classList.add('canopy-linebreak-span');
      const nextChar = token.text[cursor + 1];
      if (nextChar === '\n') {
        lineBreakSpan.classList.add('canopy-blank-linebreak');
      }
      spans.push(lineBreakSpan);
      cursor += 1; // account for the newline we just processed
    }
  });

  return spans;
}

export default renderTextToken;
