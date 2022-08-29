const fs = require('fs-extra');
const path = require('path');
const build = require('./build');
const chokidar = require('chokidar');
const shell = require('shelljs');

function watch(options) {
  let canopyLocation = process.env.CANOPY_LOCATION || path.dirname(path.dirname(fs.realpathSync(shell.which('canopy').stdout)));

  if (!fs.existsSync('topics')) {
    console.log('Error: You must be in a project directory with a topics folder');
    return;
  }

  const watcher = chokidar.watch(['topics', `${canopyLocation}/dist`], { persistent: true });

  watcher.on('change', () => {
    buildWrapper(options);
  });

  buildWrapper(options);
}

function buildWrapper(options) {
  try {
    build(options);
  } catch (e) {
    console.error(e);
  }
}

module.exports = watch;
