const fs = require('fs-extra');
const dedent = require('dedent-js');
const child_process = require('child_process');
const buildProject = require('./build/build_project');

function build({ symlinks, projectPathPrefix, hashUrls }) {
	if (!fs.existsSync('./topics')) console.error('There must be a topics directory present, try running "canopy init"') || process.exit();
	if (!fs.existsSync('./.canopy_default_topic')) console.error('There must be a default topic dotfile present, try running "canopy init"') || process.exit();

	let defaultTopic = fs.readFileSync('.canopy_default_topic').toString().trim();
	canopyLocation = child_process.execSync("echo ${CANOPY_LOCATION:-$(readlink -f $(which canopy) | xargs dirname | xargs dirname)}").toString().trim();

	fs.rmSync('build', { recursive: true, force: true });
	fs.mkdirSync('build');

	let html = dedent`
		<html>
		<head>
		<meta charset="utf-8">
		</head>
		<body>
		<div
		  id="_canopy"
		  data-default-topic="${defaultTopic}"
		  data-project-path-prefix="${projectPathPrefix}"
		  data-hash-urls="${hashUrls || ''}">
		</div>
		<script src="${projectPathPrefix}/canopy.js"></script>
		</body>
		</html>`;

	buildProject('.', symlinks);

	fs.writeFileSync('build/index.html', html);

	if (symlinks) {
		let topicDirectories = getDirectories('build');
		topicDirectories.forEach((currentTopicDirectory) => {
			topicDirectories.forEach((targetTopicDirectory) => {
				// console.log(`Creating symlink from ${targetTopicDirectory} to ${currentTopicDirectory}`);
				fs.writeFileSync(`build/${currentTopicDirectory}/index.html`, html);
				child_process.execSync(`ln -s build/${targetTopicDirectory} build/${currentTopicDirectory}/`);
			});
		});
	}

	if (!fs.existsSync(`${canopyLocation}/dist/canopy.js`)) console.error('No Canopy js build found') || process.exit();
	fs.copyFileSync(`${canopyLocation}/dist/canopy.js`, 'build/canopy.js');
	if (fs.existsSync(`${canopyLocation}/dist/canopy.js.map`)) fs.copyFileSync(`${canopyLocation}/dist/canopy.js.map`, 'build/canopy.js.map');
	if (fs.existsSync(`assets`)) fs.copySync('assets', 'build/_assets', { overwrite: true });

}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync( path + '/' + file).isDirectory() && !file.startsWith('_');
  });
}

module.exports = build;