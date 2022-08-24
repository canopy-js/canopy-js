const fs = require('fs-extra');
const dedent = require('dedent-js');
const child_process = require('child_process');
const buildProject = require('./build/build_project');

function build(options) {
  let { symlinks, projectPathPrefix, hashUrls, keepBuildDirectory, manualHtml, logging } = options;
  if (!fs.existsSync('./topics')) throw 'There must be a topics directory present, try running "canopy init"';
  if (!fs.existsSync('./.canopy_default_topic')) throw 'There must be a default topic dotfile present, try running "canopy init"';

  let defaultTopicString = fs.readFileSync('.canopy_default_topic').toString().trim();
  let canopyLocation = child_process.execSync("echo ${CANOPY_LOCATION:-$(readlink -f $(which canopy) | xargs dirname | xargs dirname)}").toString().trim();

  if (!keepBuildDirectory) fs.rmSync('build', { recursive: true, force: true });
  fs.rmSync('build/_data', { recursive: true, force: true });
  fs.ensureDirSync('build');

  if (!manualHtml) {
    let html = dedent`
      <html>
      <head>
      <meta charset="utf-8">
      </head>
      <body>
      <div
        id="_canopy"
        data-default-topic="${defaultTopicString}"
        data-project-path-prefix="${projectPathPrefix}"
        data-hash-urls="${hashUrls || ''}">
      </div>
      <script src="${projectPathPrefix}/canopy.js"></script>
      </body>
      </html>`;

    fs.writeFileSync('build/index.html', html);
  }

  buildProject('.', defaultTopicString, options);

  if (symlinks) {
    let topicDirectories = getDirectories('build');
    topicDirectories.forEach((currentTopicDirectory) => {
      topicDirectories.forEach((targetTopicDirectory) => {
        if (logging) console.log(`Creating symlink from ${targetTopicDirectory} to ${currentTopicDirectory}`);
        fs.copyFileSync('build/index.html', `build/${currentTopicDirectory}/index.html`);
        if (!fs.existsSync(`build/${currentTopicDirectory}/${targetTopicDirectory}`)) {
          fs.symlinkSync(`build/${targetTopicDirectory}`, `build/${currentTopicDirectory}/${targetTopicDirectory}`);
        }
      });
    });
  }

  if (!fs.existsSync(`${canopyLocation}/dist/canopy.js`)) {
    throw 'No Canopy js build found';
  }

  fs.copyFileSync(`${canopyLocation}/dist/canopy.js`, 'build/canopy.js');

  if (fs.existsSync(`${canopyLocation}/dist/canopy.js.map`)) {
    fs.copyFileSync(`${canopyLocation}/dist/canopy.js.map`, 'build/canopy.js.map');
  }

  if (fs.existsSync(`assets`)) {
    fs.copySync('assets', 'build/_assets', { overwrite: true });
  }

  console.log(`Built at: ${'' + new Date()}`);
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync( path + '/' + file).isDirectory() && !file.startsWith('_');
  });
}

module.exports = build;
