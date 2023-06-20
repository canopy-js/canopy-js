const fs = require('fs-extra');
const path = require('path');
const build = require('./build');
const chokidar = require('chokidar');
let chalk = require('chalk');
let shell = require('shelljs');
let { canopyLocation, tryAndWriteHtmlError } = require('./shared/helpers');

function watch(options) {
  if (!fs.existsSync('topics')) {
    console.log(chalk.red('Error: You must be in a project directory with a topics folder'));
    return;
  }

  try { // initial build
    tryAndWriteHtmlError(build, Object.assign({ ...options, ...{ logging: false }}));
    console.log(chalk.magenta(`Initial build completed successfully at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
  } catch (e) {
    console.log(chalk.magenta(`Initial build prevented by invalid data at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
    console.log(e.message);
    console.log(chalk.magenta(`If you correct the error and refresh your browser, the project should build and display properly.`));
    if (options.error) console.error(e);
  }

  const watcher = chokidar.watch(['topics', 'assets', `${canopyLocation}/dist`, `${canopyLocation}/cli`], { persistent: true, ignoreInitial: true });

  let handler = (e) => debounce(() => buildRegular({...options, ...{ filesEdited: e }}), 500);
  watcher.on('add', handler)
    .on('addDir', handler)
    .on('change', handler)
    .on('unlink', handler)
    .on('unlinkDir', handler);
}

function buildRegular(options) {
  try {
    tryAndWriteHtmlError(build, options);
  } catch (e) {
    console.error(chalk.bgRed(chalk.black(`Canopy watch process (pid ${process.pid}) failed to build topic files`)));
    console.error(e.message);
  }
}

let debounceTimer;
function debounce(callback, time) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(callback, time);
}

module.exports = watch;
