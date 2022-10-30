function sketch() {
  const { loadData } = require('./helpers');
  const Store = require('./store');
  const State = require('./state');
  let undoHistory = [];
  let redoHistory = [];
  let state = new State('construction');
  state = loadData(state);
  let store = new Store(state, undoHistory, redoHistory);
  const readline = require('readline');
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  console.log("\u001B[?25l") // hide the cursor
  console.log("\u001B[?1049h") // save state

  renderAndOutput(store.state, store);

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

    if (key.name === 'd' && key.ctrl === true) {
      console.log("\u001B[?25h"); // reenable cursor
      console.log("\u001B[?1049l") // restore state
      process.exit()
    }

    let inputString = (key.ctrl ? 'Control-' : '') + input;

    store.handleInput(inputString);

    renderAndOutput(store.state, store);
    // console.log(key);
    // console.dir(store.state.state, { depth: 4 });

    // update disk with data – Non blocking
  });

  // console.dir(store.state.state, { depth: 4 });
}

function renderAndOutput(state, store) {
  let terminalWidth = process.stdout.columns;
  let terminalHeight = process.stdout.rows;
  let output =  store.render(terminalWidth, terminalHeight, state);
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
  '\u001B[D': 'left',
  '\u0003': 'c'
}

module.exports = sketch;
