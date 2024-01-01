import {
  topicParentLink,
  moveToParent,
  moveToChild,
  moveDownOrRedirect,
  inlineCycleLink,
  depthFirstSearch,
  zoomOnLocalPath,
  removeSelection,
  duplicate,
  browserBack,
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

    if (keyName === 'escape' && !Link.selection) {
      return goToDefaultTopic();
    }

    if (Link.selection || universalShortcutRelationships.hasOwnProperty(shortcutName)) {
      (shortcutRelationships[shortcutName]||function(){})()
    } else if (shortcutRelationships[shortcutName]) {
      (Link.lastSelectionOfParagraph(Paragraph.pageRoot) || Link.selectALink()).select();
    }
  });
}

const shortcutRelationships = {
  'left': moveInDirection.bind(null, 'left'),
  'up': moveInDirection.bind(null, 'up'),
  'down': moveInDirection.bind(null, 'down'),
  'shift-down': inlineCycleLink,
  'alt-down': inlineCycleLink,
  'right': moveInDirection.bind(null, 'right'),

  'h': moveInDirection.bind(null, 'left'),
  'k': moveInDirection.bind(null, 'up'),
  'j': moveInDirection.bind(null, 'down'),
  'shift-j': inlineCycleLink,
  'alt-j': inlineCycleLink,
  'l': moveInDirection.bind(null, 'right'),

  'u': moveToParent,
  'i': moveToParent,
  'shift-enter': moveToParent,

  'n': moveToChild,
  'm': moveToChild,

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

  'tab': depthFirstSearch,
  'shift-tab': browserBack
}

const universalShortcutRelationships = [ // shortcuts that always work, even if there isn't an already selected link
  'c'
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

export default registerKeyListeners;
