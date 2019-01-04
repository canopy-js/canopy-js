import { currentSection, selectedLink, firstLinkOfSection } from 'helpers/getters';
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
import displayPath from 'display/display_path';
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

    let preventDefaultList = ['space', 'tab'];
    if (preventDefaultList.includes(keyName)) {
      e.preventDefault();
    }

    if (selectedLink()) {
      (shortcutRelationships[shortcutName]||function(){})()
    } else if (shortcutRelationships[shortcutName]) {
      displayPath(
        parsePathString(),
        null,
        true
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

  'tab': depthFirstSearch.bind(null, true),
  'alt-tab': depthFirstSearch.bind(null, true, true),
  'shift-tab': depthFirstSearch.bind(null, false)
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
  222: '\'',

  220: '\\',

  89: 'y',
  85: 'u',
  73: 'i',
  79: 'o',
  80: 'p',

  219: '[',
  221: ']',

  13: 'return',
  9: 'tab',
  27: 'escape',
  8: 'backspace',
  32: 'space',

  78: 'n',
  77: 'm',
  188: ',',
  190: '.',
  191: '/',

  192: '`',

  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',

  81: 'q',
  87: 'w',
  69: 'e',
  82: 'r',
  84: 't',

  65: 'a',
  83: 's',
  68: 'd',
  70: 'f',
  71: 'g',

  90: 'z',
  88: 'x',
  67: 'c',
  86: 'v',
  66: 'b',

  55: '7',
  56: '8',
  57: '9',
  48: '0',

  189: '-',
  187: '='
}

export default registerKeyListeners;
