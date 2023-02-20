const fs = require('fs-extra');
const path = require('path');
const build = require('./build');
const chokidar = require('chokidar');
let chalk = require('chalk');
let shell = require('shelljs');
let { canopyLocation } = require('./shared/helpers');
var stripAnsi = require('strip-ansi');

function watch(options) {
  if (!fs.existsSync('topics')) {
    console.log(chalk.red('Error: You must be in a project directory with a topics folder'));
    return;
  }

  try { // initial build
    buildAndWriteHtmlError(Object.assign({ ...options, ...{ logging: false }}));
    console.log(chalk.magenta(`Initial build completed successfully at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
  } catch (e) {
    console.log(chalk.magenta(`Initial build prevented by invalid data at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
    console.log(e.message);
    console.log(chalk.magenta(`If you correct the error and refresh your browser, the project should build and display properly.`));
  }

  const watcher = chokidar.watch(['topics', 'assets', `${canopyLocation}/dist`, `${canopyLocation}/cli`], { persistent: true, ignoreInitial: true });

  let handler = (e) => debounce(() => buildRegular({...options, ...{ filesEdited: e }}), 500);
  watcher.on('add', handler)
    .on('addDir', handler)
    .on('change', handler)
    .on('unlink', handler)
    .on('unlinkDir', handler);
}

function buildAndWriteHtmlError(options) {
  try {
    build(options);
  } catch(e) {
    if (options.sync) {
      fs.writeFileSync(
        'build/index.html',
        `<h1 style="text-align: center;">Error building project</h1>
        <p style="font-size: 24px; width: 800px; margin: auto;">${stripAnsi(e.message)}</p>`
      );
    }

    throw e; // rethrow the error so that the appropriate logging can be added
  }
}

function buildRegular(options) {
  try {
    buildAndWriteHtmlError(options);
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
