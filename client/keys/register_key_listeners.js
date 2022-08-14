import {
  currentSection,
  selectedLink,
  metadataForLink,
} from 'helpers/getters';

import {
  moveUpward,
  topicParentLink,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect,
  depthFirstSearch,
  zoomOnLocalPath,
  removeSelection
} from 'keys/key_handlers';
import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';

const registerKeyListeners = () => {
  window.addEventListener('keydown', function(e) {
    let modifiers =
      ((e.metaKey || e.keyCode === 91) ? 'meta-' : '') +
      (e.altKey ? 'alt-' : '') +
      (e.ctrlKey ? 'ctrl-' : '') +
      (e.shiftKey ? 'shift-' : '');

    let keyName = keyNames[e.keyCode];
    let shortcutName = modifiers + keyName;

    if (['tab', 'down', 'up'].includes(keyName)) {
      e.preventDefault();
    }

    if (Link.selection) {
      (shortcutRelationships[shortcutName]||function(){})()
    } else if (shortcutRelationships[shortcutName]) {
      updateView(
        Path.current,
        Link.selectALink()
      );
    }
  });
}

const shortcutRelationships = {
  'left': moveLeftward,
  'up': moveUpward,
  'down': moveDownward,
  'right': moveRightward,
  'shift-up': topicParentLink,

  'h': moveLeftward,
  'j': moveDownward,
  'k': moveUpward,
  'l': moveRightward,

  'escape': removeSelection,
  'z': zoomOnLocalPath,

  'enter': moveDownOrRedirect,
  'meta-enter': moveDownOrRedirect.bind(null, true),
  'control-enter': moveDownOrRedirect.bind(null, true), // firefox on some linux distributions doesn't recognize meta key
  'alt-enter': moveDownOrRedirect.bind(null, false, true),
  'meta-alt-enter': moveDownOrRedirect.bind(null, true, true),
  'control-alt-enter': moveDownOrRedirect.bind(null, true, true), // firefox on some linux distributions doesn't recognize meta key

  'tab': depthFirstSearch,
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
  90: 'z',

  13: 'enter',
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
