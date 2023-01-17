let runServer = require('./run_server');
let fs = require('fs');
let open = require('open');
let chalk = require('chalk');

function serve(options) {
  options = options || {};
  let port = options.port;
  let static = options.static;
  port = port || 4001;

  let validBuild = ['build', 'build/index.html', 'build/_data', 'build/_canopy.js'].map(s => fs.existsSync(s)).every(Boolean);
  if (!validBuild && !options.ignoreBuildErrors) {
    throw new Error(chalk.red(`Server aborting due to invalid build. Handle build errors and try again.`));
  }

  if (options.logging) console.log(`Serving on port ${port}`);

  runServer(port, options.logging);

  if (options.open) {
    open(`http://localhost:${port}`);
  }
}

module.exports = serve;
