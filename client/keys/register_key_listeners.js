import {
  topicParentLink,
  moveToParent,
  moveDownOrRedirect,
  inlineACycleLink,
  zoomOnLocalPath,
  removeSelection,
  duplicate,
  copyDecodedUrl,
  goToDefaultTopic
} from 'keys/key_handlers';
import { moveInDirection } from 'keys/arrow_keys';
import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';
import Paragraph from 'models/paragraph';

const registerKeyListeners = () => {
  window.addEventListener('keydown', function(e) {
    if (isActiveElementTextInput()) return; // User is typing in text box

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

    if (keyName === 'escape' && !Link.selection) {
      return goToDefaultTopic();
    }

    if (Link.selection || universalShortcutRelationships.includes(shortcutName)) {
      (shortcutRelationships[shortcutName]||function(){})()
    } else if (shortcutRelationships[shortcutName]) {
      Path.rendered.selectALink();
    }
  });
}

const shortcutRelationships = {
  'left': moveInDirection.bind(null, 'left'),
  'up': moveInDirection.bind(null, 'up'),
  'down': moveInDirection.bind(null, 'down'),
  'shift-down': inlineACycleLink,
  'alt-down': inlineACycleLink,
  'right': moveInDirection.bind(null, 'right'),

  'h': moveInDirection.bind(null, 'left'),
  'k': moveInDirection.bind(null, 'up'),
  'j': moveInDirection.bind(null, 'down'),
  'shift-j': inlineACycleLink,
  'alt-j': inlineACycleLink,
  'l': moveInDirection.bind(null, 'right'),

  'u': moveToParent,
  'i': moveToParent,
  'shift-enter': moveToParent,

  'n': moveDownOrRedirect,
  'm': moveDownOrRedirect,

  'escape': removeSelection,
  'z': zoomOnLocalPath,
  'd': duplicate,
  'shift-up': topicParentLink,
  'shift-k': topicParentLink,

  'c': copyDecodedUrl,

  'enter': () => moveDownOrRedirect({}),
  'meta-enter': () => moveDownOrRedirect({ newTab: true }), // mac
  'ctrl-enter': () => moveDownOrRedirect({ newTab: true }), // windows & linux
  'alt-enter': () => moveDownOrRedirect({ newTab: false, altKey: true }),
  'meta-alt-enter': () => moveDownOrRedirect({ newTab: true, altKey: true }), // mac
  'ctrl-alt-enter': () => moveDownOrRedirect({ newTab: true, altKey: true }), // windows & linux

  'enter-shift': () => moveDownOrRedirect({}),
  'meta-shift-enter': () => moveDownOrRedirect({ newTab: true, shiftKey: true }), // mac
  'ctrl-shift-enter': () => moveDownOrRedirect({ newTab: true, shiftKey: true }), // windows & linux
  'alt-shift-enter': () => moveDownOrRedirect({ newTab: false, altKey: true, shiftKey: true }),
  'meta-alt-shift-enter': () => moveDownOrRedirect({ newTab: true, altKey: true, shiftKey: true }), // mac
  'ctrl-alt-shift-enter': () => moveDownOrRedirect({ newTab: true, altKey: true, shiftKey: true }), // windows & linux
}

const universalShortcutRelationships = [ // shortcuts that always work, even if there isn't an already selected link
  'c',
  'up',
  'down'
];

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
  67: 'c',

  85: 'u',
  73: 'i',
  78: 'n',
  77: 'm',

  13: 'enter',
  9: 'tab',
  27: 'escape',
  32: 'space',

  192: '`',

  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
}

function isActiveElementTextInput() {
    let activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === "TEXTAREA" || (activeElement.tagName === "INPUT" && ["text", "password", "email", "search", "number", "tel", "url"].includes(activeElement.type.toLowerCase())))) {
        return true; // Active element is a text input or textarea
    }
    return false; // Active element is not a text input or textarea
}

export default registerKeyListeners;
