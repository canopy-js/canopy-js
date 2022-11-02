

let verticalPickerRenderer = (state, terminalWidth, terminalHeight) => {
  let options = state.getAttribute(state.mode, 'options');
  let selection = state.getAttribute(state.mode, 'selection');

  return splitScreen(
    terminalWidth,
    terminalHeight,
    (w, h) => outputCenter(w, h, aModeContent(state)),
    (w, h) => addExplanatoryBox(w, h, 'Pick a fruit or vegitable',
      (w, h) => outputWithRowVerticallyCentered(
        w, h,
        options.map((option, index) => {
          if (index === selection) {
            return "**" + option + "**";
          } else {
            return '  ' + option + '  ';
          }
        }).join('\n'),
        selection
      )
    )
  );
}

module.exports = verticalPickerRenderer;
