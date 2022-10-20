class State {
  constructor(mode, submode) {
    this.state = {};
    this.state.mode = mode;
    this.state.submode = submode;
    this.state.modeStates = {};
    this.state.modeStates[this.mode] = {};
    this.state.commandArray = [];
  }

  get clone() {
    let clone = new State(this.mode, this.submode);
    clone.state = JSON.parse(JSON.stringify(this.state));
    return clone;
  }

  setMode(mode, submode) {
    let clone = this.clone;
    if (typeof mode !== 'string') throw Error('Mode must be of type string')
    if (typeof submode !== 'string') throw Error('Submode must be of type string')
    clone.state.mode = mode;
    clone.state.submode = submode || 'normal';
    clone.state.modeStates[clone.mode] = clone.state.modeStates[clone.mode] || {};
    return clone;
  }

  setSubmode(submode) {
    if (typeof submode !== 'string') throw Error('Submode must be of type string')
    let clone = this.clone;
    clone.state.submode = submode;
    return clone;
  }

  get mode() {
    return this.state.mode;
  }

  get submode() {
    return this.state.submode;
  }

  setAttribute(key, value) {
    let clone = this.clone;
    clone.state.modeStates[this.mode][key] = value;
    return clone;
  }

  clearAttribute(key) {
    let clone = this.clone;
    delete clone.state.modeStates[this.mode][key];
    return clone;
  }

  setDefault(key, value) {
    let clone = this.clone;
    if (!clone.state.modeStates[clone.mode][key]) {
      clone.state.modeStates[clone.mode][key] = value;
    }
    return clone;
  }

  getAttribute(key, value) {
    return this.modeState[key];
  }

  changeAttribute(key, callback) {
    let clone = this.clone;
    clone.state.modeStates[clone.state.mode][key] = callback(clone.state.modeStates[clone.state.mode][key]);
    return clone;
  }

  get modeState() {
    return this.state.modeStates[this.mode];
  }

  get command() {
    return this.state.commandArray;
  }

  pushCommand(input) {
    let clone = this.clone;
    clone.state.commandArray.push(input);
    return clone;
  }

  clearCommand() {
    let clone = this.clone;
    clone.state.commandArray = [];
    return clone;
  }

  setAlert(message) {
    let clone = this.clone;
    clone.state.alertMessage = message;
    return clone;
  }

  get alertMessage() {
    return this.state.alertMessage;
  }

  clearAlert() {
    let clone = this.clone;
    clone.state.alertMessage = null;
    return clone;
  }

  withoutUndoRecord() {
    let clone = this.clone;
    clone.state.suppressUndoRecord = true;
    return clone;
  }

  get suppressUndoRecord() {
    return this.state.suppressUndoRecord;
  }

  withUndoRecord() {
    let clone = this.clone;
    delete clone.state.suppressUndoRecord;
    return clone;
  }
}

module.exports = State;
