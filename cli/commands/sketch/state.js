class State {
  constructor(mode) {
    this.state = {};
    this.state.mode = mode;
    this.state.local = {};
  }

  get clone() {
    let clone = new State(this.mode, this.submode);
    clone.state = JSON.parse(JSON.stringify(this.state));
    return clone;
  }

  setMode(mode) {
    let clone = this.clone;
    if (typeof mode !== 'string') throw Error(`Mode must be of type string, received: ${mode}`)
    clone.state.mode = mode;
    return clone;
  }

  get mode() {
    return this.state.mode;
  }

  get modePrefix() {
    return this.state.mode.match(/^([^.:]+)/)[1];
  }

  // Local

  setAttribute(key, value, namespace) {
    namespace = namespace || this.modePrefix;
    let clone = this.clone;
    clone.state.local[namespace] = clone.state.local[namespace] || {};
    clone.state.local[namespace][key] = value;
    return clone;
  }

  removeAttribute(key, namespace) {
    namespace = namespace || this.modePrefix;
    let clone = this.clone;
    console.log(clone.state.local, namespace, key)
    delete clone.state.local[namespace][key];
    return clone;
  }

  clearNamespace(namespace) {
    let clone = this.clone;
    delete clone.state.local[namespace];
    return clone;
  }

  setDefault(key, value, namespace) {
    namespace = namespace || this.modePrefix;
    let clone = this.clone;
    clone.state.local[namespace] = clone.state.local[namespace] || {};
    if (!clone.state.local[namespace][key]) {
      clone.state.local[namespace][key] = value;
    }
    return clone;
  }

  getAttribute(key, namespace) {
    namespace = namespace || this.modePrefix;
    return this.state.local[namespace][key];
  }

  changeAttribute(key, callback, namespace) {
    namespace = namespace || this.modePrefix;
    let clone = this.clone;
    clone.state.local[namespace][key] = callback(clone.state.local[namespace][key]);
    return clone;
  }

  // Global //

  setGlobalAttribute(key, value) {
    let clone = this.clone;
    clone.state[key] = value;
    return clone;
  }

  removeGlobalAttribute(key) {
    let clone = this.clone;
    delete clone.state[key];
    return clone;
  }

  setGlobalDefault(key, value) {
    let clone = this.clone;
    clone.state[key] = clone.state[key] || value;
    return clone;
  }

  getGlobalAttribute(key) {
    return this.state[key];
  }

  changeGlobalAttribute(key, callback) {
    let clone = this.clone;
    clone.state[key] = callback(clone.state[key]);
    return clone;
  }

  setReturn(key, value) {
    let clone = this.clone;
    clone.state[key] = clone.state[key] || value;
    return clone;
  }

  getReturn(key) {
    let value = this.state[key];
    if (!value) throw new Error(`Return value ${key} not found`);
    delete this.state[key];
    return value;
  }

  // Flags //

  setFlag(key, value) {
    let clone = this.clone;
    clone.state.flags = clone.state.flags || {};
    clone.state.flags[key] = value;
    return clone;
  }

  getFlag(key) {
    return this.state?.flags?.[key];
  }

  clearFlags(key, value) {
    let clone = this.clone;
    delete clone.state.flags;
    return clone;
  }
}

module.exports = State;
