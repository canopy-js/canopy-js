let Maps = {
  a: {
    normal: {
      b: state => { return state.setMode('b', 'normal'); },

      '?': state => {
        return state.setAlert('The A state has a custom key helper message');
      },

      'z': state => {
        return state.setSubmode('insert');
      },

      letter: {
        number: {
          number: (state, command) => state.setAttribute('value', command.join(''))
        }
      }
    },
    insert: {
      alphanumeric: (state, input) => {
        return state.changeAttribute('message', message => message += input).withoutUndoRecord();
      },
      return: (state, input) => {
        return state.setAlert(state.getAttribute('message')).clearAttribute('message').setSubmode('normal');
      }
    }
  },

  b: {
    normal: {
      a: state => {
        return state.setMode('a', 'normal');
      },
      c: state => {
        return state.changeAttribute('number', number => number + 1)
      },
      p: state => {
        return state.setAttribute('number', 0)
      }
    }
  },
}

let DefaultKeyMaps = { // keys avaliable in every submode by default
  '?': state => {
    return state.setAlert(`Key list: a, b, c, ?\n\nHello world.`);
  }
};

let Initializers = {
  'a': {
    normal: state => state.setDefault('value', 'Pick a value'),
    insert: state => state.setDefault('message', '')
  },
  'b': {
    normal: state => state.setDefault('number', 0)
  }
}

Object.keys(Maps).forEach((mode) => {
  Object.keys(Maps[mode]).forEach(submode => {
    Maps[mode][submode] = Object.assign({}, DefaultKeyMaps, Maps[mode][submode]);
  })
});

let DefaultSubmodes = { // submodes avaliable in every mode by default
  'alert': {
    any: state => {
      return state.clearAlert();
    }
  }
};

Object.keys(Maps).forEach((mode) => {
  Maps[mode] = Object.assign({}, DefaultSubmodes, Maps[mode]);
});

const Hooks = {
  beforeEach: state => state.clearAlert().withUndoRecord()
};

module.exports = { Maps, Initializers, Hooks };
