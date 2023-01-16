const serve = require('./serve/serve');
const watch = require('./watch');

function dev(options) {
  watch(options);
  serve(options);
}

module.exports = dev;
