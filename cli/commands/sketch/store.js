const { Modes, Initializers } = require('./modes');

class Store {
  constructor(state, undoHistory, redoHistory) {
    this.undoHistory = undoHistory;
    this.redoHistory = redoHistory;
    this.setState(state);
  }

  setState(newState) {
    let oldState = this.state?.clone;

    if (Initializers[newState.mode]) {
      newState = Initializers[newState.mode](newState);
    }

    this.state = newState.clone;

    if (oldState && !oldState.getFlag('suppressUndo')) {
      this.undoHistory.push(oldState);
    }

    this.redoHistory = [];
  }

  handleInput(input) {
    if (input === 'Control-u') {
      if (this.undoHistory.length > 0) {
        this.redoHistory.push(this.state);
        this.state = this.undoHistory.pop();
      }
      return;
    }

    if (input === 'Control-r') {
      if (this.redoHistory.length > 0) {
        this.undoHistory.push(this.state);
        this.state = this.redoHistory.pop();
      }
      return;
    }

    let newState = this.state;

    newState = newState.clearFlags();

    let handlerObject = Modes[this.state.mode];
    let handlerFunction;

    if (handlerObject[input]) {
      handlerFunction = handlerObject[input];
    } else if (handlerObject['letter'] && input.match(/^[A-Za-z]$/)) {
      handlerFunction = handlerObject['letter'];
    } else if (handlerObject['number'] && input.match(/^[0-9]$/)) {
      handlerFunction = handlerObject['number'];
    } else if (handlerObject['alphanumeric'] && input.match(/^[A-Za-z0-9]$/)) {
      handlerFunction = handlerObject['alphanumeric'];
    } else if (handlerObject['character'] && input.match(/^.$/g)) {
      handlerFunction = handlerObject['character'];
    } else if (handlerObject['any']) {
      handlerFunction = handlerObject['any'];
    }

    newState = handlerFunction && handlerFunction(newState, input) || newState;

    this.setState(newState);
  }
}

module.exports = Store;
