let render = (state, terminalWidth, terminalHeight) => {
  if (!terminalWidth) throw new Error("help!")
  let output = renderRules.find(rule => rule.test(state)).render(state, terminalWidth, terminalHeight);
  if (!output) throw new Error(`Render function didn't return output for mode: ${state.mode}`);
  return output;
}

renderRules = [
  {
    test: state => state.mode.endsWith('verticalPicker'),
    render: (state, terminalWidth, terminalHeight) => {
      let options = state.getAttribute(state.mode, 'options');
      let selection = state.getAttribute(state.mode, 'selection');
      return outputWithRowVerticallyCentered(
        terminalWidth,
        terminalHeight,
        options.map((option, index) => {
          if (index === selection) {
            return "**" + option + "**";
          } else {
            return '  ' + option + '  ';
          }
        }).join('\n'),
        selection
      )
    }
  },

  {
    test: state => state.mode === 'alert',
    render: (state, terminalWidth, terminalHeight) => wrapWithBorder(
      terminalWidth,
      terminalHeight,
      outputCenter,
      state.getAttribute('alert', 'message')
    )
  },

  {
    test: state => state.mode.match(/^a(\.|:|$)/),
    render: (state, terminalWidth, terminalHeight) => outputCenter(
      terminalWidth,
      terminalHeight,
      `We are in the 'a' state\n\n` +
      `Value: ${state.getAttribute('a', 'value')}\n\n` +
      `Command: ${state.getGlobalAttribute('command')?.join('') || ''}\n\n` +
      `Buffer: ${state.getAttribute('a', 'buffer') || ''}` +
      (state.mode === 'a.insert' ? '\n\nINSERT' : '')
    )
  },

  {
    test: state => state.mode.match(/^b:?/),
    render: (state, terminalWidth, terminalHeight) => outputCenter(
      terminalWidth,
      terminalHeight,
      `We are in the 'b' state\n\n` +
      `Number: ${state.getAttribute('b', 'number')}`
    )
  },

  {
    test: state => true,
    render: (state, terminalWidth, terminalHeight) => outputCenter(
      terminalWidth,
      terminalHeight,
      `Unable to find a renderer for: ${state.mode}`
    )
  }
]


function outputCenter(terminalWidth, terminalHeight, message) {
  let output = '';

  let messageHeight = message.split('\n').length;
  let verticalPaddingHeightAbove = Math.round((terminalHeight / 2) - (messageHeight / 2));
  let verticalPaddingHeightBelow = Math.floor((terminalHeight / 2) - (messageHeight / 2));

  for (let i = 0; i < verticalPaddingHeightAbove; i++) {
    output += "\n";
  }

  let lines = message.split('\n');
  let maxDataWidth = lines.reduce((memo, value) => { return Math.max(memo, value.length); }, 0);
  let horizontalPaddingWidth = (terminalWidth / 2) - (maxDataWidth / 2);

  lines.forEach(data => {
    let paddingString = '';
    for (let i = 0; i < horizontalPaddingWidth; i++) {
      paddingString += ' ';
    }
    output += paddingString + data + "\n";
  });

  for (let i = 0; i < verticalPaddingHeightBelow; i++) {
    if (i > 0) output += "\n";
  }
  console.log([lines]);

  return output;
}

function wrapWithBorder(terminalWidth, terminalHeight, otherRenderFunction, ...renderArguments) {
  let existingContent = otherRenderFunction.apply(null, [terminalWidth - 2, terminalHeight - 2].concat(renderArguments));
  let linesOfExistingContent = existingContent.split('\n');

  let newOutput = '┌';
  for (let i = 0; i < terminalWidth - 2; i++) { // -2 for each corner
    newOutput += '─';
  }
  newOutput += '┐\n';
  for (let i = 0; i < linesOfExistingContent.length; i++) {
    let additionalRightPadding = terminalWidth - linesOfExistingContent[i].length - 2; // 2 for both border pipes
    newOutput += '│' + linesOfExistingContent[i] + ' '.repeat(additionalRightPadding) + '│';
  }
  newOutput += '└';
  for (let i = 0; i < terminalWidth - 2; i++) { //-2 for each corner
    newOutput += '─';
  }
  newOutput += '┘';
  return newOutput;
}

function outputWithRowVerticallyCentered(terminalWidth, terminalHeight, message, indexOfVerticallyCenteredRow) {
  let output = '';

  let lines = message.split('\n');
  let rowsAboveCenter = Math.round((terminalHeight - 1) / 2);
  let indexOfFirstVisibleElement = Math.max(indexOfVerticallyCenteredRow - rowsAboveCenter, 0);

  let rowsBelowCenter = Math.floor((terminalHeight - 1) / 2);
  let indexOfLastVisibleElement = Math.min(indexOfVerticallyCenteredRow + rowsBelowCenter, lines.length - 1);
  let indexAfterLastVisibleElement = indexOfLastVisibleElement + 1;

  let truncatedLines = lines.slice(indexOfFirstVisibleElement, indexAfterLastVisibleElement);

  let totalNumberOfVisibleElements = truncatedLines.length;
  let numberOfElementsAboveCenter = Math.min(indexOfVerticallyCenteredRow, rowsAboveCenter);
  let verticalPaddingNecessaryAbove = rowsAboveCenter - numberOfElementsAboveCenter;

  let numberOfElementsBelowCenter = totalNumberOfVisibleElements - numberOfElementsAboveCenter - 1;
  let verticalPaddingNecessaryBelow = rowsBelowCenter - numberOfElementsBelowCenter;

  for (let i = 0; i < verticalPaddingNecessaryAbove; i++) {
    output += '\n';
  }

  let maxDataWidth = lines.reduce((memo, value) => { return Math.max(memo, value.length); }, 0);
  let horizontalPaddingWidth = Math.round((terminalWidth / 2) - (maxDataWidth / 2));

  truncatedLines.forEach(data => {
    let paddingString = '';
    for (let i = 0; i < horizontalPaddingWidth; i++) {
      paddingString += ' ';
    }
    output += paddingString + data + "\n";
  });

  for (let i = 0; i < verticalPaddingNecessaryBelow; i++) {
    output += "\n";
  }

  output = output.slice(0, -1); // remove last newline

  return output;
}

module.exports = render;
