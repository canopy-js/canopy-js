const fs = require('fs-extra');
const child_process = require('child_process');
const build = require('./build');
const chokidar = require('chokidar');

function watch(mode, options) {
	let canopyLocation = child_process
		.execSync("echo ${CANOPY_LOCATION:-$(readlink -f $(which canopy) | xargs dirname | xargs dirname)}")
		.toString().trim();

	if (!fs.existsSync('topics')) {
		console.log('You must be in a project directory with a topics folder');
		return;
	}

	const watcher = chokidar.watch(['topics', `${canopyLocation}/dist`], { persistent: true });

	watcher.on('change', () => {
		build(options);
	});

	build(options);
}

module.exports = watch;
