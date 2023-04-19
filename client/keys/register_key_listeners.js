import {
  moveUpward,
  topicParentLink,
  moveDownward,
  moveLeftward,
  moveRightward,
  moveDownOrRedirect,
  depthFirstSearch,
  zoomOnLocalPath,
  removeSelection,
  duplicate
} from 'keys/key_handlers';
import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';

const registerKeyListeners = () => {
  window.addEventListener('keydown', function(e) {
    if (document.activeElement.tagName === "INPUT") return; // User is typing in text box

    let modifiers =
      (e.metaKey ? 'meta-' : '') +
      (e.ctrlKey ? 'ctrl-' : '') +
      (e.altKey ? 'alt-' : '') +
      (e.shiftKey ? 'shift-' : '');

    let keyName = keyNames[e.keyCode];
    let shortcutName = modifiers + keyName;

    if (['tab', 'down', 'up', 'left', 'right'].includes(keyName)) {
      if (!((e.metaKey || e.ctrlKey) && ['left', 'right'].includes(keyName))) { // unless browser back
        e.preventDefault();
      }
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
  'd': duplicate,
  'shift-up': topicParentLink,
  'shift-k': topicParentLink,

  'enter': () => moveDownOrRedirect({}),
  'meta-enter': () => moveDownOrRedirect({ newTab: true }), // mac
  'ctrl-enter': () => moveDownOrRedirect({ newTab: true }), // windows & linux
  'alt-enter': () => moveDownOrRedirect({ newTab: false, altKey: true }),
  'meta-alt-enter': () => moveDownOrRedirect({ newTab: true, altKey: true }), // mac
  'ctrl-alt-enter': () => moveDownOrRedirect({ newTab: true, altKey: true }), // windows & linux

  'tab': depthFirstSearch
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
  68: 'd',

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
