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

  if (!options.suppressInitialBuild || (options.buildIfUnbuilt && !fs.existsSync('topics/build/data'))) {
    buildWrapper(options);
  }

  const watcher = chokidar.watch(['topics', `${canopyLocation}/dist`], { persistent: true, ignoreInitial: true });

  let debounceTimer;
  const debounce = (callback, time) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(callback, time);
  }

  watcher.on('add', (e) => {
    debounce(() => buildWrapper({...options, ...{ filesEdited: e }}), 500);
  }).on('addDir', (e) => {
    debounce(() => buildWrapper({...options, ...{ filesEdited: e }}), 500);
  }).on('change', (e) => {
    debounce(() => buildWrapper({...options, ...{ filesEdited: e }}), 500);
  }).on('unlink', (e) => {
    debounce(() => buildWrapper({...options, ...{ filesEdited: e }}), 500);
  }).on('unlinkDir', (e) => {
    debounce(() => buildWrapper({...options, ...{ filesEdited: e }}), 500);
  })
}

function buildWrapper(options) {
  try {
    build(options);
  } catch (e) {
    console.error(chalk.red(`Canopy watch process pid ${process.pid} failed to build topic files`));
    if (options.sync) {
      fs.writeFileSync('canopy_bulk_file', fs.readFileSync('canopy_bulk_file').toString() + `\n// ${e.message}`);
    } else {
      console.error(e.message);
    }
  }
}

module.exports = watch;
