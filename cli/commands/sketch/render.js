let render = (state) => {
  if (state.alertMessage) {
    return outputCenter(state.alertMessage);
  }

  return (renderFunctions[state.mode][state.submode] || renderFunctions[state.mode]['all'])(state);
}

let renderFunctions = {
  a: {
    all: (state) => outputCenter(`We are in the 'a' state\n\nValue: ${state.getAttribute('value')}\n\nCommand: ${state.command.join('')}`)
  },

  b: {
    all: (state) => outputCenter(`We are in the 'b' state\n\nNumber: ${state.getAttribute('number')}`)
  }
}

let DefaultSubmodeRenderFunctions = {
  alert: state => {
    outputCenter(state.alert);
  }
};

function outputCenter(message) {
  let output = '';
  let terminalWidth = process.stdout.columns;
  let terminalHeight = process.stdout.rows;

  let messageHeight = message.split('\n').length;
  let verticalPaddingHeight = (terminalHeight / 2) - (messageHeight / 2);

  for (let i = 0; i < verticalPaddingHeight; i++) {
    if (i > 0) output += "\n";
    // process.stdout.write(''+(i+1));
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

  for (let i = 0; i < verticalPaddingHeight; i++) {
    if (i > 0) output += "\n";
    // process.stdout.write(''+(i+1));
  }

  return output;
}

module.exports = render;
