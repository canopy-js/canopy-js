let runStatic = require('./static');
let runDynamic = require('./dynamic');
let build = require('../build');
let fs = require('fs');

function serve(options) {
	let { port, static } = options;

  let validBuild = ['build', 'build/index.html', 'build/_data', 'build/canopy.js'].map(s => fs.existsSync(s)).every(Boolean);
  if (!validBuild) {
    console.error(`Build directory is invalid, try running \`canopy build\``);
    process.exit();
  }

  console.log(`Serving on port ${port}`);

	if(static) {
		runStatic(port);
	} else {
		runDynamic(port);
	}
}

module.exports = serve;
