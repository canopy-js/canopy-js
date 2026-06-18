var express = require('express');
var app = express();
let chalk = require('chalk');
let path = require('path');
let { staticBuildDirectory } = require('../shared/build_paths');
const healthCheckPath = '/_canopy_health';
const fatalListenErrorExitCode = 2;

let buildPath = process.env.BUILD_ROOT || path.resolve(process.cwd(), staticBuildDirectory);
buildPath = path.join(buildPath, path.sep);

let loggingFlag;

app.use(function(req, res, next) {
  res.on('finish', function() {
    if (loggingFlag && req.url !== healthCheckPath) console.log(chalk.dim(`${req.url} - ${res.statusCode}`));
  });
  next();
});

app.get(healthCheckPath, (_req, res) => {
  res.sendStatus(200);
});

// static file serve
app.use('*/_canopy.js', express.static(buildPath + '_canopy.js'));
app.use('*/_canopy.js.map', express.static(buildPath + '_canopy.js.map'));
app.use('*/_data', express.static(buildPath + '_data'));
app.use('*/_assets', express.static(buildPath + '_assets'));

// not found in static files, so default to index.html
app.use((req, res) => res.sendFile(buildPath + 'index.html'));

function runServer(port, logging) {
  loggingFlag = logging;
  const server = app.listen(port, () => {
    if (loggingFlag) console.log(chalk.gray(`Server child (pid ${process.pid}) listening on port ${port}`));
  });

  server.on('close', () => {
    if (loggingFlag) console.log(chalk.gray(`Server child (pid ${process.pid}) HTTP server closed`));
  });

  server.on('error', (error) => {
    console.error(chalk.red(`Server child (pid ${process.pid}) HTTP server error: ${error.message}`));
    const exitCode = isFatalListenError(error) ? fatalListenErrorExitCode : 1;
    process.exit(exitCode);
  });

  const shutdown = () => {
    if (loggingFlag) console.log(chalk.gray(`Server child (pid ${process.pid}) shutting down`));
    try {
      server.close(() => process.exit(0));
    } catch (_) {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => {
    if (loggingFlag) console.log(chalk.gray(`Server child (pid ${process.pid}) received SIGTERM`));
    shutdown();
  });
  process.on('SIGINT', () => {
    if (loggingFlag) console.log(chalk.gray(`Server child (pid ${process.pid}) received SIGINT`));
    shutdown();
  });
  process.on('exit', (code) => {
    if (loggingFlag) console.log(chalk.gray(`Server child (pid ${process.pid}) exited with code ${code}`));
  });
  process.on('uncaughtException', (error) => {
    console.error(chalk.red(`Server child (pid ${process.pid}) uncaught exception: ${error.message}`));
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    const message = reason && reason.stack ? reason.stack : reason;
    console.error(chalk.red(`Server child (pid ${process.pid}) unhandled rejection: ${message}`));
    process.exit(1);
  });
}

module.exports = runServer;

function isFatalListenError(error) {
  return error && ['EADDRINUSE', 'EACCES'].includes(error.code);
}
