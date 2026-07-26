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
import ScrollableContainer from 'helpers/scrollable_container';
import Path from 'models/path';
import Link from 'models/link';

const ARROW_HOLD_DELAY_MS = 250;
const ARROW_SCROLL_PIXELS_PER_SECOND = 600;
const arrowKeyPresses = {};

const registerKeyListeners = () => {
  window.addEventListener('keydown', function(e) {
    if (isActiveElementEditable()) return; // User is typing in an editable element

    let modifiers =
      (e.metaKey ? 'meta-' : '') +
      (e.ctrlKey ? 'ctrl-' : '') +
      (e.altKey ? 'alt-' : '') +
      (e.shiftKey ? 'shift-' : '');

    let keyName = keyNames[e.keyCode];
    let shortcutName = modifiers + keyName;
    if (isArrowKey(keyName) && !isBrowserNavigationArrow(e, keyName)) {
      e.preventDefault();
      return trackArrowKeyDown(keyName, shortcutName, e.repeat);
    }

    if (keyName === 'tab') {
      e.preventDefault();
    }

    handleShortcut(shortcutName, keyName);
  });

  window.addEventListener('keyup', function(e) {
    let keyName = keyNames[e.keyCode];
    if (!isArrowKey(keyName)) return;

    let press = stopArrowKeyPress(keyName);
    if (!press || press.held || isActiveElementEditable()) return;

    handleShortcut(press.shortcutName, keyName);
  });

  window.addEventListener('blur', stopAllArrowKeyPresses);
}

function handleShortcut(shortcutName, keyName) {
  if (keyName === 'escape' && !Link.selection) {
    return goToDefaultTopic();
  }

  if (Link.selection || universalShortcutRelationships.includes(shortcutName)) {
    (shortcutRelationships[shortcutName]||function(){})()
  } else if (shortcutRelationships[shortcutName]) {
    Path.rendered.selectALink();
  }
}

function isArrowKey(keyName) {
  return ['down', 'up', 'left', 'right'].includes(keyName);
}

function isBrowserNavigationArrow(e, keyName) {
  return (e.metaKey || e.ctrlKey) && ['left', 'right'].includes(keyName);
}

function trackArrowKeyDown(keyName, shortcutName, isRepeat) {
  let existingPress = arrowKeyPresses[keyName];
  if (existingPress) {
    startArrowKeyScrolling(existingPress);
    return;
  }

  let press = {
    animationFrame: null,
    held: false,
    keyName,
    shortcutName,
    timer: null
  };
  arrowKeyPresses[keyName] = press;

  if (isRepeat) {
    startArrowKeyScrolling(press);
  } else {
    press.timer = window.setTimeout(() => startArrowKeyScrolling(press), ARROW_HOLD_DELAY_MS);
  }
}

function startArrowKeyScrolling(press) {
  if (press.held) return;

  press.held = true;
  window.clearTimeout(press.timer);

  let lastFrameTime;
  let scroll = currentTime => {
    if (arrowKeyPresses[press.keyName] !== press) return;

    if (lastFrameTime !== undefined) {
      let elapsed = Math.min(currentTime - lastFrameTime, 50);
      let distance = elapsed * ARROW_SCROLL_PIXELS_PER_SECOND / 1000;
      let direction = arrowScrollDirections[press.keyName];
      ScrollableContainer.scrollBy({
        behavior: 'instant',
        left: direction.left * distance,
        top: direction.top * distance
      });
    }

    lastFrameTime = currentTime;
    press.animationFrame = window.requestAnimationFrame(scroll);
  };

  press.animationFrame = window.requestAnimationFrame(scroll);
}

function stopArrowKeyPress(keyName) {
  let press = arrowKeyPresses[keyName];
  if (!press) return null;

  window.clearTimeout(press.timer);
  window.cancelAnimationFrame(press.animationFrame);
  delete arrowKeyPresses[keyName];
  return press;
}

function stopAllArrowKeyPresses() {
  Object.keys(arrowKeyPresses).forEach(stopArrowKeyPress);
}

const arrowScrollDirections = {
  'left': { left: -1, top: 0 },
  'up': { left: 0, top: -1 },
  'down': { left: 0, top: 1 },
  'right': { left: 1, top: 0 }
};

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
  'd',
  'up',
  'down',
  'z'
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

function isActiveElementEditable() {
  let activeElement = document.activeElement;
  if (!activeElement) return false;

  if (activeElement.isContentEditable) return true;
  if (activeElement.tagName === 'TEXTAREA') return true;
  return activeElement.tagName === 'INPUT' &&
    ['text', 'password', 'email', 'search', 'number', 'tel', 'url'].includes(activeElement.type.toLowerCase());
}

registerKeyListeners();
