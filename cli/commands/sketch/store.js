const { Maps, Initializers, Hooks } = require('./maps');

class Store {
  constructor(state, undoHistory, redoHistory) {
    this.undoHistory = undoHistory;
    this.redoHistory = redoHistory;
    this.setState(state);
  }

  setState(newState) {
    let oldState = this.state?.clone;
    this.state = newState.clone;

    if (Initializers[newState.mode]?.[newState.submode]) {
      let oldState = this.state;
      this.state = Initializers[newState.mode][newState.submode](this.state);
      if (!this.state) throw new Error(`Mode initalizer function didn't return state: ${oldState.mode}`);
    }

    console.log(oldState)
    if (oldState && !oldState.suppressUndoRecord) {
      this.undoHistory.push(oldState);
    }

    this.redoHistory = [];
  }

  handleInput(input) {
    if (input === 'u') {
      if (this.undoHistory.length > 0) {
        this.redoHistory.push(this.state);
        this.state = this.undoHistory.pop();
      }
      return;
    }

    if (input === 'U') {
      if (this.redoHistory.length > 0) {
        this.undoHistory.push(this.state);
        this.state = this.redoHistory.pop();
      }
      return;
    }

    let newState = this.state;

    if (Hooks.beforeEach) {
      newState = Hooks.beforeEach(newState);
      if (!newState) throw new Error(`BeforeAll hook didn't return state`);
    }

    let handlerObject = Maps[this.state.mode][this.state.submode];
    let existingCommand = this.state.command;
    newState = newState.clearCommand();

    existingCommand.concat([input]).forEach((commandChar) => {
      if (handlerObject?.[commandChar]) {
        handlerObject = handlerObject[commandChar];
      } else if (commandChar.match(/^[A-Za-z]$/) && handlerObject?.['letter']) {
        handlerObject = handlerObject?.['letter'];
      } else if (commandChar.match(/^[0-9]$/) && handlerObject?.['number']) {
        handlerObject = handlerObject?.['number'];
      } else if (commandChar.match(/^[A-Za-z0-9]$/) && handlerObject?.['alphanumeric']) {
        handlerObject = handlerObject?.['alphanumeric'];
      } else if (handlerObject?.['any']) {
        handlerObject = handlerObject?.['any'];
      } else {
        handlerObject = null; // ignore rest of command
      }

      if (typeof handlerObject === 'function') {
        newState = handlerObject(newState.clearCommand().withUndoRecord(), newState.command.concat([input]));
      } else if (handlerObject && typeof handlerObject === 'object') {
        newState = newState.pushCommand(commandChar).withoutUndoRecord();
      } else if (!handlerObject) {
        newState = newState.clearCommand();
      }
    });

    if (!newState) throw new Error(`Map function didn't return state: ${this.state.mode}, ${input}`);
    this.setState(newState);
  }
}

module.exports = Store;
