let runServer = require('./run_server');
let fs = require('fs');
let open = require('open');
let chalk = require('chalk');

function serve(options) {
  options = options || {};
  let port = options.port;
  let static = options.static;
  port = port || Math.floor((Math.random() * 6500) + 500);

  let validBuild = ['build', 'build/index.html', 'build/_data', 'build/canopy.js'].map(s => fs.existsSync(s)).every(Boolean);
  if (!validBuild) {
    throw new Error(`Error: Cannot start server because build directory is invalid, try running \`canopy build\` and check for errors`);
  }

  if (options.logging) console.log(`Serving on port ${port}`);

  runServer(port, options.logging);

  if (!options.suppressOpen) {
    open(`http://localhost:${port}`);
  }
}

module.exports = serve;
