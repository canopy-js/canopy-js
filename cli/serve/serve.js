const { fork } = require('child_process');
const fs = require('fs');
const http = require('http');
const chalk = require('chalk');
const path = require('path');
const chokidar = require('chokidar');

const pollIntervalMs = 500;
const healthCheckIntervalMs = 5000;
const healthCheckTimeoutMs = 2000;
const healthCheckPath = '/_canopy_health';
const fatalListenErrorExitCode = 2;

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
    fatalListenError: false,
    healthCheckInFlight: false,
    shuttingDown: false
  };

  const ensureServerState = () => {
    if (state.fatalListenError) return;
    if (!hasValidBuild()) return handleMissingBuild(state);
    return ensureRunning(state, port, options, hasValidBuild, ensureServerState);
  };

  startServerIfReady(state, port, options, hasValidBuild, ensureServerState);

  const poller = setInterval(ensureServerState, pollIntervalMs);
  const healthChecker = setInterval(() => {
    healthCheck(state, port, options, hasValidBuild, ensureServerState);
  }, healthCheckIntervalMs);
  const watcher = watchBuildRoot(buildRoot, ensureServerState, state);

  registerShutdown(options, () => {
    state.shuttingDown = true;
    stopChild(state);
    try { watcher.close(); } catch (_) { /* ignore */ }
    clearInterval(poller);
    clearInterval(healthChecker);
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
  if (state.fatalListenError) return;
  if (!hasValidBuild()) return;
  startChild(state, port, options, hasValidBuild, ensureServerState);
}

function ensureRunning(state, port, options, hasValidBuild, ensureServerState) {
  if (state.fatalListenError) return;
  if (state.child || state.restarting) return;
  if (options.logging) console.log(chalk.gray(`Server child is not present; starting replacement on port ${port}`));
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
    if (code === fatalListenErrorExitCode) {
      state.fatalListenError = true;
      console.error(chalk.red(`Server cannot listen on port ${port}; not restarting. Choose another port or stop the process currently using it.`));
      return;
    }

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

  child.on('close', (code, signal) => {
    if (options.logging) {
      const reason = signal ? `signal ${signal}` : `code ${code}`;
      console.log(chalk.gray(`Server child pid ${child.pid} closed with ${reason}; parent pid ${process.pid}`));
    }
  });

  child.on('disconnect', () => {
    if (options.logging) console.log(chalk.gray(`Server child pid ${child.pid} disconnected from parent pid ${process.pid}`));
  });
}

function stopChild(state) {
  if (!state.child) return;
  try {
    const signaled = state.child.kill('SIGTERM');
    if (!signaled) state.child = null;
  } catch (_) { /* ignore */ }
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

function registerShutdown(options, fn) {
  process.once('exit', (code) => {
    if (options?.logging) console.log(chalk.gray(`Server parent pid ${process.pid} exited with code ${code}`));
    fn();
  });
  ['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => {
    process.once(signal, () => {
      if (options?.logging) console.log(chalk.gray(`Server parent pid ${process.pid} received ${signal}`));
      fn();
    });
  });
  process.once('uncaughtException', (error) => {
    console.error(chalk.red(`Server parent pid ${process.pid} uncaught exception: ${error.message}`));
    fn();
  });
  process.once('unhandledRejection', (error) => {
    const message = error && error.stack ? error.stack : error;
    console.error(chalk.red(`Server parent pid ${process.pid} unhandled rejection: ${message}`));
    fn();
  });
}

function healthCheck(state, port, options, hasValidBuild, ensureServerState) {
  if (state.shuttingDown || state.healthCheckInFlight) return;
  if (state.fatalListenError) return;
  if (!hasValidBuild()) return;
  if (!state.child) {
    if (options.logging) console.log(chalk.gray(`Health check found no server child on port ${port}; restarting`));
    ensureServerState();
    return;
  }

  state.healthCheckInFlight = true;
  const request = http.get(
    { host: '127.0.0.1', port, path: healthCheckPath, timeout: healthCheckTimeoutMs },
    (response) => {
      response.resume();
      state.healthCheckInFlight = false;
      if (response.statusCode >= 500) {
        console.error(chalk.red(`Health check failed with status ${response.statusCode}; restarting child pid ${state.child && state.child.pid}`));
        if (!state.shuttingDown && hasValidBuild()) {
          restartChild(state, options);
        }
      }
    }
  );

  request.on('timeout', () => {
    request.destroy(new Error(`health check timeout after ${healthCheckTimeoutMs}ms`));
  });
  request.on('error', (error) => {
    state.healthCheckInFlight = false;
    console.error(chalk.red(`Health check request failed: ${error.message}; restarting child pid ${state.child && state.child.pid}`));
    if (!state.shuttingDown && hasValidBuild()) {
      restartChild(state, options);
    }
  });
}

function restartChild(state, options) {
  if (!state.child || state.shuttingDown) return;
  if (options.logging) console.log(chalk.gray(`Requesting restart for child pid ${state.child.pid}`));
  try {
    const signaled = state.child.kill('SIGTERM');
    if (!signaled) {
      if (options.logging) console.log(chalk.gray(`Server child pid ${state.child.pid} was already gone`));
      state.child = null;
    }
  } catch (error) {
    console.error(chalk.red(`Could not stop server child pid ${state.child.pid}: ${error.message}`));
    state.child = null;
  }
}
