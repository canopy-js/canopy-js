const ModeManager = require('./mode_manager');
const {
  outputCenter,
  wrapWithTightBorder
} = require('./renderers/helpers');


ModeManager.createMode('b');
ModeManager.registerInitializer('b', state => state.setDefault('number', 0));
ModeManager.createAlert('b', 'a', 'Going to A!', 'a');
ModeManager.createCommand('b', 'c', state => state.changeAttribute('number', number => number + 1));
ModeManager.createCommand('b', 'p', state => state.setAttribute('number', 0));
ModeManager.createCommand('b', 'character', (state, [input]) => ModeManager.generators.alert(input, 'b')(state));

ModeManager.registerRenderer('b', (w, h, state) => outputCenter(
  w, h,
  wrapWithTightBorder(
    `We are in the 'b' state\n\n` +
    `Number: ${state.getAttribute('number')}`
  )
));
