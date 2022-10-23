let Modes = {};

// A

Modes['a'] = {};

Modes['a']['b'] = createAlert('Going to B!', 'b');

Modes['a']['?'] =
  state => state
  .setMode('alert')
  .setAttribute('alert', 'alert', 'The A state has a custom key helper message')
  .setAttribute('alert', 'returnMode', 'a');

Modes['a']['z'] = state => state.setMode('a.insert').setFlag('suppressUndo', true);

Modes['a']['q'] = createVerticalPicker(
  'a.verticalPicker',
  'a.insert',
  ['apples', 'oranges', 'pears', 'cucumbers', 'bananas', 'grapes', 'kiwis', 'mangos', 'grapefruit', 'melon'],
  state => state.setAttribute('a', 'buffer', state.getAttribute('a.verticalPicker', 'result'))
);

addMultiKeyInput(
  'a',
  ['letter', 'number', 'number'],
  (state, commandArray) => state.setAttribute('a', 'value', commandArray.join('')).setMode('a')
);

// A.Insert

Modes['a.insert'] = {};

Modes['a.insert']['character'] = (state, input) => state
  .changeAttribute('a', 'buffer', buffer => buffer += input)
  .setFlag('suppressUndo', true);

Modes['a.insert']['backspace'] = (state, input) => state
  .changeAttribute('a', 'buffer', buffer => buffer.slice(0, -1))
  .setFlag('suppressUndo', true);

Modes['a.insert']['return'] = state => createAlert(state.getAttribute('a', 'buffer'), 'a')(state).removeAttribute('a', 'buffer');

// B

Modes['b'] = {};

Modes['b']['a'] = createAlert('Going to A!', 'a');

Modes['b']['c'] = state => state.changeAttribute('b', 'number', number => number + 1);
Modes['b']['p'] = state => state.setAttribute('b', 'number', 0);

Modes['b']['character'] = (state, input) => createAlert(input, 'b')(state);

// Alert

Modes['alert'] = {};
Modes['alert']['any'] =
  state => state
    .setMode(state.getAttribute('alert', 'returnMode'))
    .clearNamespace('alert');

function createAlert(message, returnMode) {
  return state => state
    .setMode('alert')
    .setAttribute('alert', 'message', message)
    .setAttribute('alert', 'returnMode', returnMode)
    .setFlag('suppressUndo', true);
}

// Initializers

Initializers = {};
Initializers['a'] = state => state.setDefault('a', 'value', null);
Initializers['a.insert'] = state => state.setDefault('a', 'buffer', '');
Initializers['b'] = state => state.setDefault('b', 'number', 0);
Initializers['picker'] = state => {
  if (!state.getAttribute('picker', 'options')) throw new Error(`Caller didn't give picker options`)
  return state;
}

function createVerticalPicker(pickerModeName, returnMode, options, postProcessingCallback) {
  Modes[pickerModeName] = Modes[pickerModeName] || {};

  Modes[pickerModeName]['up'] = state => state
    .changeAttribute(pickerModeName, 'selection', index => Math.max(index - 1, 0))
    .setFlag('suppressUndo', true);

  Modes[pickerModeName]['k'] = state => state
    .changeAttribute(pickerModeName, 'selection', index => Math.max(index - 1, 0))
    .setFlag('suppressUndo', true);

  Modes[pickerModeName]['down'] = state => state
    .changeAttribute(pickerModeName, 'selection', index => Math.min(index + 1, state.getAttribute(pickerModeName, 'options').length - 1))
    .setFlag('suppressUndo', true);

  Modes[pickerModeName]['j'] = state => state
    .changeAttribute(pickerModeName, 'selection', index => Math.min(index + 1, state.getAttribute(pickerModeName, 'options').length - 1))
    .setFlag('suppressUndo', true);

  Modes[pickerModeName]['return'] = state => postProcessingCallback(
    state
      .setMode(returnMode)
      .setAttribute(
        pickerModeName,
        'result',
        state.getAttribute(pickerModeName, 'options')[state.getAttribute(pickerModeName, 'selection')]
      )
    ).clearNamespace(pickerModeName);

  return state => state
    .setMode(pickerModeName)
    .setAttribute(pickerModeName, 'options', options)
    .setAttribute(pickerModeName, 'selection', 0);
}

function addMultiKeyInput(initialMode, commandArray, handlerFunction) {
  Modes[initialMode] = Modes[initialMode] || {};

  Modes[initialMode][commandArray[0]] = (state, input) => state
    .setMode(`${initialMode}:${commandArray[0]}`)
    .setGlobalAttribute('command', [input])
    .setFlag('suppressUndo', true);

  let finalMode = commandArray.slice(1, -1).reduce((mode, commandItem) => {
    Modes[mode] = Modes[mode] || {};

    Modes[mode][commandItem] = (state, input) => state
      .setMode(`${mode}:${commandItem}`)
      .changeGlobalAttribute('command', command => command.concat(input))
      .setFlag('suppressUndo', true);

    Modes[mode]['any'] = state => state
      .removeGlobalAttribute('command')
      .setMode(state.mode.split(':')[0]);

    return `${mode}:${commandItem}`;
  }, `${initialMode}:${commandArray[0]}`);

  Modes[finalMode] = Modes[finalMode] || {};

  Modes[finalMode][commandArray.slice(-1)[0]] = (state, finalInput) => handlerFunction(
    state.removeGlobalAttribute('command'),
    state.getGlobalAttribute('command').concat(finalInput)
  );

  Modes[finalMode]['any'] = state => state.removeGlobalAttribute('command').setMode(state.mode.split(':')[0]);
}

module.exports = { Modes, Initializers };
