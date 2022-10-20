function sketch() {
  const readline = require('readline');
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  const { loadData } = require('./helpers');
  const render = require('./render');
  const { maps, beforeMaps } = require('./maps');

  let undoHistory = [];
  let redoHistory = [];
  const Store = require('./store');
  const State = require('./state');
  let state = new State('a', 'normal');
  let store = new Store(state, undoHistory, redoHistory);

  console.log("\u001B[?25l") // hide the cursor
  console.log("\u001B[?1049h") // save state
  console.log(render(store.state));

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

    store.handleInput(input);

    let output = render(store.state);
    console.clear();
    console.log(output);
    // console.log(JSON.stringify(store.state));

    // update disk with data
  });
}

let sequenceMap = {
  '\u0004': 'backspace',
  '\u007F': 'delete',
  '\u001B': 'escape',
  '\r': 'return'
}

module.exports = sketch;
