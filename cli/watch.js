const fs = require('fs-extra');
const build = require('./build');
const chokidar = require('chokidar');
const path = require('path');
const { spawn } = require('child_process');
let chalk = require('chalk');
let { canopyLocation, tryAndWriteHtmlError } = require('./shared/fs-helpers');
let { killActiveFullBuildProcesses } = require('./shared/full_build_processes');

let fullBuildChild = null;
let fullBuildRequestedAt = 0;

function watch(options = {}) {
  if (!fs.existsSync('topics')) {
    console.log(chalk.red('Error: You must be in a project directory with a topics folder'));
    return;
  }

  try { // initial build
    buildRegular(options, { rethrowErrors: true });
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

  process.on('exit', cleanupBackgroundFullBuild);
}

function buildRegular(options = {}, { rethrowErrors = false } = {}) {
  const requestedAt = nextRequestedAt();
  const buildOptions = shouldRunFullBuildInBackground(options)
    ? { ...options, deferFullBuild: true }
    : options;

  try {
    if (options.onBuildError) {
      build({ ...buildOptions, skipInitialBuild: options.filesEdited?.includes('canopy-js/client') });
    } else {
      tryAndWriteHtmlError(build, { ...buildOptions, skipInitialBuild: options.filesEdited?.includes('canopy-js/client') }); // client changes skip JSON gen
    }
    if (shouldRunFullBuildInBackground(options)) spawnBackgroundFullBuild(options, requestedAt);
  } catch (e) {
    if (rethrowErrors) throw e;
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

function shouldRunFullBuildInBackground(options) {
  return Boolean(options.cache && !options.skipInitialBuild && !options.filesEdited?.includes('canopy-js/client'));
}

function nextRequestedAt() {
  fullBuildRequestedAt = Math.max(Date.now(), fullBuildRequestedAt + 1);
  return fullBuildRequestedAt;
}

function spawnBackgroundFullBuild(options, requestedAt) {
  killActiveFullBuildProcesses();
  if (fullBuildChild) fullBuildChild.kill();

  const childOptions = {
    cache: false,
    replaceBuildDirectory: false,
    logging: options.logging,
    pretty: options.pretty,
    orphans: options.orphans,
    reciprocals: options.reciprocals,
    sync: options.sync,
    bulkFileName: options.bulkFileName
  };

  const child = spawn(
    process.execPath,
    [path.join(__dirname, 'build', 'run_background_full_build.js'), JSON.stringify(childOptions)],
    {
      cwd: process.cwd(),
      stdio: 'inherit'
    }
  );

  fullBuildChild = child;
  child.requestedAt = requestedAt;
  child.on('exit', (_code, signal) => {
    if (fullBuildChild !== child) return;
    if (signal === 'SIGTERM') return;
    if (child.requestedAt !== fullBuildRequestedAt) return;
    fullBuildChild = null;
  });
}

function cleanupBackgroundFullBuild() {
  if (fullBuildChild) fullBuildChild.kill();
}

module.exports = watch;
