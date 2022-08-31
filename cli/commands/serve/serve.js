let runServer = require('./run_server');
let fs = require('fs');
let open = require('open');

function serve(options) {
  let { port, static } = options;

  let validBuild = ['build', 'build/index.html', 'build/_data', 'build/canopy.js'].map(s => fs.existsSync(s)).every(Boolean);
  if (!validBuild) {
    throw new Error(`Error: Build directory is invalid, try running \`canopy build\``);
  }

  console.log(`Serving on port ${port}`);

  runServer(port);

  if (!options.suppressOpen) {
    open(`http://localhost:${port}`);
  }
}

module.exports = serve;
