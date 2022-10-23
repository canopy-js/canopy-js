const { loadData } = require('./helpers');
const render = require('./render');
const { Modes } = require('./modes');
const Store = require('./store');
const State = require('./state');

function sketch() {
  const readline = require('readline');
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  let undoHistory = [];
  let redoHistory = [];
  let state = new State('a', 'normal');
  let store = new Store(state, undoHistory, redoHistory);

  console.log("\u001B[?25l") // hide the cursor
  console.log("\u001B[?1049h") // save state

  renderAndOutput(store.state);

  process.stdout.on('resize', function() {
    renderAndOutput(store.state);
  });

  process.stdin.on('keypress', (str, key) => {
    let input;
    if (sequenceMap[key.sequence]) {
      input = sequenceMap[key.sequence];
    } else {
      input = key.sequence;
    }

    if (key.name === 'c' && key.ctrl === true) {
      console.log("\u001B[?25h"); // reenable cursor
      console.log("\u001B[?1049l") // restore state
      process.exit()
    }

    let inputString = (key.ctrl ? 'Control-' : '') + input;

    store.handleInput(inputString);

    renderAndOutput(store.state);
    // console.log(JSON.stringify(store.state));

    // update disk with data
  });

  // console.log(JSON.stringify(store.state));
}

function renderAndOutput(state) {
  let terminalWidth = process.stdout.columns;
  let terminalHeight = process.stdout.rows;
  let output = render(state, terminalWidth, terminalHeight);
  console.clear();
  process.stdout.write(output);
}

let sequenceMap = {
  '\u0004': 'delete',
  '\u007F': 'backspace',
  '\u001B': 'escape',
  '\r': 'return',
  '\x15': 'u',
  '\x12': 'r',
  '\t': 'tab',
  '\u001B[B': 'down',
  '\u001B[A': 'up',
  '\u001B[C': 'right',
  '\u001B[D': 'left'
}

module.exports = sketch;
