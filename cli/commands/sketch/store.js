const ModeManager = require('./modes/mode_manager');
require('./modes/a');
require('./modes/b');
// ModeManager.log();

class Store {
  constructor(state, undoHistory, redoHistory) {
    this.undoHistory = undoHistory;
    this.redoHistory = redoHistory;
    this.setState(state);
  }

  setState(newState) {
    let oldState = this.state?.clone;

    if (ModeManager.getInitializer(newState.mode)) {
      newState = (ModeManager.getInitializer(newState.mode)||(s => s))(newState);
    }

    this.state = newState.clone;

    if (oldState && !oldState.getFlag('suppressUndo')) {
      this.undoHistory.push(oldState);
    }

    this.redoHistory = [];
  }

  render(w,h) {
    return ModeManager.getRenderer(this.state.mode)(w, h, this.state);
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

    let handlerFunction;
    if (ModeManager.getHandler(this.state.mode, input)) {
      handlerFunction = ModeManager.getHandler(this.state.mode, input);
    } else if (ModeManager.getHandler(this.state.mode, 'letter') && input.match(/^[A-Za-z]$/)) {
      handlerFunction = ModeManager.getHandler(this.state.mode, 'letter');
    } else if (ModeManager.getHandler(this.state.mode, 'number') && input.match(/^[0-9]$/)) {
      handlerFunction = ModeManager.getHandler(this.state.mode, 'number');
    } else if (ModeManager.getHandler(this.state.mode, 'alphanumeric') && input.match(/^[A-Za-z0-9]$/)) {
      handlerFunction = ModeManager.getHandler(this.state.mode, 'alphanumeric');
    } else if (ModeManager.getHandler(this.state.mode, 'character') && input.match(/^.$/g)) {
      handlerFunction = ModeManager.getHandler(this.state.mode, 'character');
    } else if (ModeManager.getHandler(this.state.mode, 'any')) {
      handlerFunction = ModeManager.getHandler(this.state.mode, 'any');;
    }


    newState = handlerFunction && handlerFunction(newState, [input]) || newState;

    this.setState(newState);
  }
}

module.exports = Store;
