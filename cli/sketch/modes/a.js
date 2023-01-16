const ModeManager = require('./mode_manager');
const {
  outputCenter,
  verticallyCenterSelectedRow,
  splitScreen,
  withExplanatoryBoxPrepend,
  withExplanatoryBoxOverlay,
  wrapWithTightBorder
} = require('./renderers/helpers');

ModeManager.createMode('a');
ModeManager.registerInitializer('a', state => state.setDefault('value', null));
ModeManager.createAlert('a', 'b', 'Going to B!', 'b');
ModeManager.createAlert('a', '?', 'The A state has a custom key helper message');
ModeManager.createCommand('a', 'z', state => state.setMode('a.insert').setFlag('suppressUndo', true));
ModeManager.createVerticalPicker({
  initialMode: 'a',
  initialKey: 'q',
  pickerModeName: 'a-fruitPicker',
  options: ['apples', 'oranges', 'pears', 'cucumbers', 'bananas', 'grapes', 'kiwis', 'mangos', 'grapefruit', 'melon'],
  returnMode: 'a.insert',
  postProcessingCallback: state => state.setAttribute('buffer', state.getFlag('result'))
});

// How would you toggle split screen? a.fruitPicker.singlePane ? Or two vertical picker calls?

ModeManager.registerRenderer('a-fruitPicker', (w, h, state) => {
  let options = state.getAttribute('options');
  let selection = state.getAttribute('selection');

  return splitScreen(w, h,
    (w, h) => outputCenter(w, h, aModeContent(state)),
    (w, h) => withExplanatoryBoxOverlay(w, h, 'Pick a fruit or vegitable',
      (w, h) => verticallyCenterSelectedRow(
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
});

ModeManager.createMultiKeyCommand(
  'a',
  ['letter', 'number', 'number'],
  (state, keyArray) => state.setMode('a').setAttribute('value', keyArray.join(''))
);

ModeManager.createMode('a.insert');
ModeManager.registerInitializer('a', state => state.setDefault('buffer', ''));

ModeManager.createCommand('a.insert', 'character',
  (state, [input]) => state
    .changeAttribute('buffer', buffer => buffer += input)
    .setFlag('suppressUndo', true)
);

ModeManager.createCommand('a.insert', 'backspace',
  (state, [input]) => state
  .changeAttribute('buffer', buffer => buffer.slice(0, -1))
  .setFlag('suppressUndo', true)
);

ModeManager.createCommand(
  'a.insert',
  'return',
  state => ModeManager.generators.alert(
    state.getAttribute('buffer'),
    'a'
  )(state).removeAttribute('buffer', 'a')
);

ModeManager.registerRenderer(
  'a',
  (screenWidth, screenHeight, state) => withExplanatoryBoxOverlay(
    screenWidth, screenHeight,
    'Hello world',
    (contentWidth, contentHeight) => outputCenter(
      contentWidth, contentHeight,
      wrapWithTightBorder(aModeContent(state))
    )
  )
);

function aModeContent(state) {
  return `We are in the 'a' state\n\n` +
    `Value: ${state.getAttribute('value')}\n\n` +
    `Command: ${state.getGlobalAttribute('command')?.join('') || ''}\n\n` +
    `Buffer: ${state.getAttribute('buffer') || ''}` +
    (state.mode === 'a.insert' ? '\n\nINSERT' : '');
}
