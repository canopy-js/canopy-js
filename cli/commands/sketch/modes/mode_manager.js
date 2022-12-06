let { wrapWithOuterBorder, outputCenter, wrapWithTightBorder } = require('./renderers/helpers');

let ModeManager = {};

ModeManager._modes = {};
ModeManager._initializers = {};
ModeManager._fileSystemChangeHandlers = {};
ModeManager._renderers = [];
ModeManager._defaultKeyBindings = {};

ModeManager.createMode = function (modeName) {
  this._modes[modeName] = this._modes[modeName] || Object.create(ModeManager._defaultKeyBindings);
}

ModeManager.createCommand = function (modeName, key, handlerFunction) {
  if (!this._modes[modeName]) throw new Error('Creating command for non-existent mode');
  if (this._modes[modeName].hasOwnProperty(key)) throw new Error(`Conflicting command definitions for mode: '${modeName}' and key: ${key}`);
  this._modes[modeName][key] = handlerFunction;
}

ModeManager.createDefaultCommand = function (key, handlerFunction) {
  if (this._defaultKeyBindings.hasOwnProperty(key)) throw new Error(`Conflicting default command for key: ${key}`);
  this._defaultKeyBindings[key] = handlerFunction;
}

ModeManager.getHandler = function(modeName, key) {
  return this._modes[modeName][key];
}

ModeManager.registerInitializer = function(modeName, initializerFunction) {
  if (typeof initializerFunction !== 'function') throw new Error('Error!');
  this._initializers[modeName] = this._initializers[modeName] || [];
  this._initializers[modeName].push(initializerFunction);
}

ModeManager.getInitializer = function(modeName) {
  return (state) => (this._initializers[modeName]||[]).reduce((state, initializer) => initializer(state), state);
}

ModeManager.registerRenderer = function(modeName, renderFunction) {
  this._renderers[modeName] = renderFunction;
}

ModeManager.getRenderer = function(modeName) {
  let modeNameComponents = modeName.match(/([:.]?[^.:]+)/g);

  for (let i = 0; i < modeNameComponents.length; i++) {
    let modeNamePrefix = modeNameComponents.slice(0, modeNameComponents.length - i).join('');
    if (this._renderers[modeNamePrefix]) {
      return this._renderers[modeNamePrefix];
    }
  }
  return (w, h, state) => outputCenter(w, h, `Unable to find a renderer matching: ${state.mode}`);
}

ModeManager.createMultiKeyCommand = function addMultiKeyInput(initialMode, commandArray, handlerFunction) {
  this.createMode(initialMode);

  this.createCommand(
    initialMode,
    commandArray[0],
    (state, input) => state
      .setMode(`${initialMode}:${commandArray[0]}`)
      .setGlobalAttribute('command', [input])
      .setFlag('suppressUndo', true)
  );

  let finalModeString = commandArray.slice(1, -1).reduce((modeString, key) => {
    this.createMode(modeString);

    this.createCommand(
      modeString,
      key,
      (state, input) => state
        .setMode(`${modeString}:${key}`)
        .changeGlobalAttribute('command', command => command.concat(input))
        .setFlag('suppressUndo', true)
    );

    this.createCommand(
      modeString,
      'any',
      state => state
        .removeGlobalAttribute('command')
        .setMode(state.mode.split(':')[0])
    );

    return `${modeString}:${key}`;


  }, `${initialMode}:${commandArray[0]}`);

  this.createMode(finalModeString);

  this.createCommand(finalModeString, commandArray.slice(-1)[0], (state, finalInput) => handlerFunction(
    state.removeGlobalAttribute('command'),
    state.getGlobalAttribute('command').concat(finalInput)
  ));

  ModeManager.createCommand(
    finalModeString,
    'any',
    state => state
      .removeGlobalAttribute('command')
      .setMode(state.mode.split(':')[0])
  );
}

ModeManager.createVerticalPicker = function ({initialMode, initialKey, pickerModeName, options, returnMode, postProcessingCallback}) {
  ModeManager.createMode(pickerModeName);

  ModeManager.createCommand(
    pickerModeName,
    'up',
    state => state
    .changeAttribute('selection', index => Math.max(index - 1, 0))
    .setFlag('suppressUndo', true)
  );

  ModeManager.createCommand(
    pickerModeName,
    'k',
    state => state
    .changeAttribute('selection', index => Math.max(index - 1, 0))
    .setFlag('suppressUndo', true)
  );

  ModeManager.createCommand(
    pickerModeName,
    'down',
    state => state
      .changeAttribute(
        'selection',
        index => Math.min(index + 1, state.getAttribute('options').length - 1)
      ).setFlag('suppressUndo', true)
  );

  ModeManager.createCommand(
    pickerModeName,
    'j',
    state => state
      .changeAttribute(
        'selection',
        index => Math.min(index + 1, state.getAttribute('options').length - 1)
      ).setFlag('suppressUndo', true)
  );

  ModeManager.createCommand(
    pickerModeName,
    'Control-c',
    state => state
      .setMode(initialMode)
      .clearNamespace(pickerModeName)
  );

  ModeManager.createCommand(
    pickerModeName,
    'return',
    state => postProcessingCallback(
      state
        .setMode(returnMode)
        .setFlag('result', state.getAttribute('options')[state.getAttribute('selection')])
    ).clearNamespace(pickerModeName));

  ModeManager.createCommand(
    initialMode,
    initialKey,
    state => state
      .setMode(pickerModeName)
      .setAttribute('options', options)
      .setAttribute('selection', 0)
  );
}

ModeManager.createAlert = function(originatingMode, key, message, returnMode) {
  returnMode = returnMode || originatingMode;
  ModeManager.createCommand(originatingMode, key, ModeManager.generators.alert(message, returnMode));
}

ModeManager.generators = {};
ModeManager.generators.alert = function createAlert(message, returnMode) {
  return state => state
    .setMode('alert')
    .setReturn('message', message)
    .setReturn('returnMode', returnMode)
    .setFlag('suppressUndo', true);
}

ModeManager.createMode('alert');

ModeManager.createCommand(
  'alert',
  'any',
  state => state.setMode(state.getReturn('returnMode'))
);

ModeManager.registerRenderer(
  'alert',
  (w, h, state) => outputCenter(
    w,h, wrapWithTightBorder(
      state.getReturn('message')
    )
  )
);

ModeManager.createDefaultCommand('Control-c', () => {
  console.log("\u001B[?25h"); // reenable cursor
  console.log("\u001B[?1049l") // restore state
  process.exit()
});

ModeManager.createMode('construction');
ModeManager.registerRenderer('construction', (w,h) => outputCenter(w,h, 'This feature doesn\'t exist yet'));

ModeManager.log = function() {
  let Strings = {};
  Object.keys(ModeManager._modes).forEach(key => {
    let newObject = {};
    Object.keys(ModeManager._modes[key]).forEach(letter => {
      Strings[key] = Strings[key] || {};
      Strings[key][letter] = ModeManager._modes[key][letter].toString()
    });
  });
  console.log(Strings);
}

module.exports = ModeManager;
