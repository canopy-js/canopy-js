import {
  currentSection,
  selectedLink,
  metadataForLink,
} from 'helpers/getters';

import {
  moveUpward,
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
      (e.metaKey ? 'command-' : '') +
      (e.altKey ? 'alt-' : '') +
      (e.ctrlKey ? 'ctrl-' : '') +
      (e.shiftKey ? 'shift-' : '');

    let keyName = keyNames[e.keyCode];
    let shortcutName = modifiers + keyName;

    if (keyName === 'tab') {
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

  'h': moveLeftward,
  'j': moveDownward,
  'k': moveUpward,
  'l': moveRightward,

  'escape': removeSelection,
  'z': zoomOnLocalPath,

  'return': moveDownOrRedirect,
  'command-return': moveDownOrRedirect.bind(null, true),
  'alt-return': moveDownOrRedirect.bind(null, false, true),
  'command-alt-return': moveDownOrRedirect.bind(null, true, true),

  'tab': depthFirstSearch.bind(null, 1),
  'shift-tab': depthFirstSearch.bind(null, -1)
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
