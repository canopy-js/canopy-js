const { fork } = require('child_process');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const chokidar = require('chokidar');

function serve(options = {}) {
  const port = options.port || 4001;
  const { buildRoot, hasValidBuild } = getBuildState();

  if (!hasValidBuild() && !options.ignoreBuildErrors) {
    throw new Error(chalk.red(`Server aborting due to invalid build. Handle build errors and try again.`));
  }

  const state = {
    child: null,
    restarting: false,
    missingBuildWarned: false,
    shuttingDown: false
  };

  const ensureServerState = () => {
    if (!hasValidBuild()) return handleMissingBuild(state);
    return ensureRunning(state, port, options, hasValidBuild, ensureServerState);
  };

  startServerIfReady(state, port, options, hasValidBuild, ensureServerState);

  const pollIntervalMs = 500;
  const poller = setInterval(ensureServerState, pollIntervalMs);
  const watcher = watchBuildRoot(buildRoot, ensureServerState, state);

  registerShutdown(() => {
    state.shuttingDown = true;
    stopChild(state);
    try { watcher.close(); } catch (_) { /* ignore */ }
    clearInterval(poller);
  });

  return state.child;
}

module.exports = serve;

function getBuildState() {
  const buildRoot = path.resolve(process.cwd(), 'build');
  const buildChecks = [
    buildRoot,
    path.join(buildRoot, 'index.html'),
    path.join(buildRoot, '_data'),
    path.join(buildRoot, '_canopy.js')
  ];
  const hasValidBuild = () => buildChecks.every(s => fs.existsSync(s));
  return { buildRoot, hasValidBuild };
}

function startServerIfReady(state, port, options, hasValidBuild, ensureServerState) {
  if (!hasValidBuild()) return;
  startChild(state, port, options, hasValidBuild, ensureServerState);
}

function ensureRunning(state, port, options, hasValidBuild, ensureServerState) {
  if (state.child || state.restarting) return;
  state.restarting = true;
  startChild(state, port, options, hasValidBuild, ensureServerState);
  state.restarting = false;
  state.missingBuildWarned = false;
}

function handleMissingBuild(state) {
  stopChild(state);
  if (!state.missingBuildWarned) {
    console.error(chalk.red('Error: External process removed build directory, waiting for restore.'));
    state.missingBuildWarned = true;
  }
}

function startChild(state, port, options, hasValidBuild, ensureServerState) {
  if (state.child) return;
  state.child = fork(path.resolve(__dirname, './fork_server.js'), [], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(port),
      LOGGING: options.logging ? '1' : '0',
      OPEN: options.open ? '1' : '0'
    }
  });
  const child = state.child;
  if (options.logging) console.log(chalk.gray(`Server parent (pid ${process.pid}) forked child (pid ${child.pid}) for port ${port}`));

  child.on('exit', (code, signal) => {
    if (state.child === child) state.child = null;

    if (options.logging) {
      const reason = signal ? `signal ${signal}` : `code ${code}`;
      console.log(chalk.gray(`Server child pid ${child.pid} exited with ${reason}; parent pid ${process.pid}`));
    }

    if (!state.shuttingDown && hasValidBuild()) ensureServerState();
  });

  child.on('error', (error) => {
    if (state.child === child) state.child = null;
    console.error(chalk.red(`Server child pid ${child.pid || 'unknown'} failed under parent pid ${process.pid}: ${error.message}`));
    if (!state.shuttingDown && hasValidBuild()) ensureServerState();
  });
}

function stopChild(state) {
  if (!state.child) return;
  try { state.child.kill('SIGTERM'); } catch (_) { /* ignore */ }
  state.child = null;
}

function watchBuildRoot(buildRoot, ensureServerState, state) {
  const watcher = chokidar.watch(buildRoot, { persistent: true, ignoreInitial: true, depth: 2 });
  watcher.on('unlinkDir', (p) => {
    if (path.resolve(p) === buildRoot) handleMissingBuild(state);
  });
  watcher.on('add', ensureServerState);
  watcher.on('addDir', ensureServerState);
  watcher.on('change', ensureServerState);
  return watcher;
}

function registerShutdown(fn) {
  ['exit', 'SIGINT', 'SIGTERM', 'SIGUSR2', 'uncaughtException'].forEach(event => {
    process.once(event, fn);
  });
}
