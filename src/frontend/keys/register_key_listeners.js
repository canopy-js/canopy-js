import { currentSection, selectedLink } from 'helpers/getters';
import {
  firstSiblingOf,
  lastSiblingOf,
  leftwardLink,
  rightwardLink,
  linkAfter,
  linkBefore,
  upwardLink,
  downwardLink
} from 'keys/relationships';

import displaySelectedLink from 'display/display_selected_link';

// Copyright Greenhouse Software 2017
const registerKeyListeners = () => {
  window.addEventListener('keydown', function(e) {
    var modifiers =
      (e.metaKey ? 'command-' : '') +
      (e.altKey ? 'alt-' : '') +
      (e.ctrlKey ? 'ctrl-' : '') +
      (e.shiftKey ? 'shift-' : '');

    var keyName = keyNames[e.keyCode];
    var shortcutName = modifiers + keyName;

    var preventDefaultList = ['space', 'tab'];
    if (preventDefaultList.includes(keyName)) {
      e.preventDefault();
    }

    var newTab = false;

    var linkElement = (shortcutRelationships[shortcutName]||function(){})() ||
      selectedLink();

    displaySelectedLink(linkElement);
  });
}

// Pressing down on alias link should cause redirect

const shortcutRelationships = {
  'left': leftwardLink,
  'up': upwardLink,
  'down': downwardLink,
  'right': rightwardLink,

  'h': leftwardLink,
  'j': upwardLink,
  'k': downwardLink,
  'l': rightwardLink
}

function openLink(link, newTab) {
  if (newTab) {
    openInNewTab(link);
  } else {
    setFragmentToHashOfLink(link);
  }
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
