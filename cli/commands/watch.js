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

  buildWrapper(options);

  const watcher = chokidar.watch(['topics', `${canopyLocation}/dist`], { persistent: true, ignoreInitial: true });
  watcher.on('add', (e) => {
    buildWrapper({...options, ...{ filesEdited: e }});
  }).on('addDir', (e) => {
    buildWrapper({...options, ...{ filesEdited: e }});
  }).on('change', (e) => {
    buildWrapper({...options, ...{ filesEdited: e }});
  }).on('unlink', (e) => {
    buildWrapper({...options, ...{ filesEdited: e }});
  }).on('unlinkDir', (e) => {
    buildWrapper({...options, ...{ filesEdited: e }});
  })
}

function buildWrapper(options) {
  try {
    build(options);
  } catch (e) {
    console.error(`Canopy watch process pid ${process.pid} failed to build topic files`);
    console.error(e.message);
  }
}

module.exports = watch;
