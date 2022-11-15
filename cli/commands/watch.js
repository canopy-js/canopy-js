const fs = require('fs-extra');
const path = require('path');
const build = require('./build');
const chokidar = require('chokidar');
const shell = require('shelljs');
let chalk = require('chalk');

function watch(options) {
  let canopyLocation = process.env.CANOPY_LOCATION || path.dirname(path.dirname(fs.realpathSync(shell.which('canopy').stdout)));

  if (!fs.existsSync('topics')) {
    console.log('Error: You must be in a project directory with a topics folder');
    return;
  }

  if (!options.suppressInitialBuild || (options.buildIfUnbuilt && !fs.existsSync('topics/build/_data'))) {
    buildWrapper(options);
  }

  const watcher = chokidar.watch(['topics', `${canopyLocation}/dist`], { persistent: true, ignoreInitial: true });

  let handler = (e) => debounce(() => buildWrapper({...options, ...{ filesEdited: e }}), 500);
  watcher.on('add', handler)
    .on('addDir', handler)
    .on('change', handler)
    .on('unlink', handler)
    .on('unlinkDir', handler);
}

function buildWrapper(options) {
  try {
    build(options);
  } catch (e) {
    console.error(chalk.bgRed(chalk.black(`Canopy watch process (pid ${process.pid}) failed to build topic files`)));
    console.error(e);
  }
}

let debounceTimer;
function debounce(callback, time) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(callback, time);
}

module.exports = watch;
