const fs = require('fs-extra');
const build = require('./build');
const chokidar = require('chokidar');
let chalk = require('chalk');
let { canopyLocation, tryAndWriteHtmlError } = require('./shared/fs-helpers');

function watch(options = {}) {
  if (!fs.existsSync('topics')) {
    console.log(chalk.red('Error: You must be in a project directory with a topics folder'));
    return;
  }

  try { // initial build
    options.onBuildError ? build(options) : tryAndWriteHtmlError(build, options);
    console.log(chalk.magenta(`Initial build completed successfully at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
  } catch (e) {
    if (options.onBuildError) {
      options.onBuildError(e); // let caller translate/write html and keep watcher running
    } else {
      console.log(e.message);
      if (options.error) console.error(e);
    }
    console.log(chalk.magenta(`Initial build prevented by invalid data at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
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

function buildRegular(options = {}) {
  try {
    if (options.onBuildError) {
      build({ ...options, skipInitialBuild: options.filesEdited.includes('canopy-js/client') });
    } else {
      tryAndWriteHtmlError(build, {...options, skipInitialBuild: options.filesEdited.includes('canopy-js/client') }); // client changes skip JSON gen
    }
  } catch (e) {
    if (options.onBuildError) return options.onBuildError(e); // handle translation/html writing in caller
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
