function renderTextToken(token) {
  let spans = [];

  if (!token.text.includes('\n')) {
    let spanElement = document.createElement('SPAN');
    spanElement.classList.add('canopy-text-span');
    spanElement.innerText = token.text;
    return [spanElement];
  }

  token.text.split('\n').forEach((textSegment, index, segments) => {
    if (textSegment) {
      let spanElement = document.createElement('SPAN');
      spanElement.classList.add('canopy-text-span');

      spanElement.innerText = textSegment;
      spans.push(spanElement);
    }

    if (index !== segments.length - 1) { // even if no text segment, insert linebreak
      let lineBreakSpan = document.createElement('SPAN');
      lineBreakSpan.classList.add('canopy-linebreak-span');
      if (!textSegment) {
        lineBreakSpan.classList.add('canopy-blank-linebreak');
      }
      spans.push(lineBreakSpan);
    }
  });

  return spans;
}

export default renderTextToken;
