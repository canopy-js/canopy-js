const { fork } = require('child_process');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

function serve(options = {}) {
  const port = options.port || 4001;

  const validBuild = [
    'build',
    'build/index.html',
    'build/_data',
    'build/_canopy.js'
  ].map(s => fs.existsSync(s)).every(Boolean);

  if (!validBuild && !options.ignoreBuildErrors) {
    throw new Error(chalk.red(`Server aborting due to invalid build. Handle build errors and try again.`));
  }

  const child = fork(path.resolve(__dirname, './fork_server.js'), [], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(port),
      LOGGING: options.logging ? '1' : '0',
      OPEN: options.open ? '1' : '0'
    }
  });

  const shutdown = () => {
    try { child.kill('SIGTERM'); } catch (_) { /* ignore */ }
  };

  ['exit', 'SIGINT', 'SIGTERM', 'SIGUSR2', 'uncaughtException'].forEach(event => {
    process.once(event, shutdown);
  });

  return child;
}

module.exports = serve;
