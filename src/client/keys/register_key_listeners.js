import { currentSection, selectedLink } from 'helpers/getters';
import {
  moveUpward,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect,
  depthFirstSearch,
  reverseDepthFirstSearch,
  goToEnclosingTopic,
  goToParentOfEnclosingTopic
} from 'keys/key_handlers';
import updateView from 'display/update_view';
import parsePathString from 'path/parse_path_string';

const registerKeyListeners = () => {
  window.addEventListener('keydown', function(e) {
    let modifiers =
      (e.metaKey ? 'command-' : '') +
      (e.altKey ? 'alt-' : '') +
      (e.ctrlKey ? 'ctrl-' : '') +
      (e.shiftKey ? 'shift-' : '');

    let keyName = keyNames[e.keyCode];
    let shortcutName = modifiers + keyName;

    if (keyName === 'tab') {
      e.preventDefault();
    }

    if (selectedLink()) {
      (shortcutRelationships[shortcutName]||function(){})()
    } else if (shortcutRelationships[shortcutName]) {
      updateView(
        parsePathString(),
        { selectALink: true }
      );
    }
  });
}

const shortcutRelationships = {
  'left': moveLeftward,
  'up': moveUpward,
  'down': moveDownward,
  'right': moveRightward,

  'h': moveLeftward,
  'j': moveDownward,
  'k': moveUpward,
  'l': moveRightward,

  'escape': goToParentOfEnclosingTopic,
  'shift-escape': goToEnclosingTopic,

  'return': moveDownOrRedirect,
  'command-return': moveDownOrRedirect.bind(null, true),
  'command-alt-return': moveDownOrRedirect.bind(null, true, true),

  'tab': depthFirstSearch.bind(null, 1, false, false),
  'alt-tab': depthFirstSearch.bind(null, 1, true, true),
  '`': depthFirstSearch.bind(null, 1, false, true),
  'shift-tab': depthFirstSearch.bind(null, 2, false, false),
  'alt-shift-tab': depthFirstSearch.bind(null, 2, true, true),
  'shift-`': depthFirstSearch.bind(null, 2, false, true),
}

const keyNames = {
  37: 'left',
  39: 'right',
  38: 'up',
  40: 'down',

  71: 'g',
  72: 'h',
  75: 'k',
  74: 'j',
  76: 'l',
  186: ';',

  13: 'return',
  9: 'tab',
  27: 'escape',

  192: '`',

  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
}

export default registerKeyListeners;
