const fs = require('fs-extra');
const path = require('path');
const dedent = require('dedent-js');
const shell = require('shelljs');
const buildProject = require('./build/build_project');

function build(options) {
  let { symlinks, projectPathPrefix, hashUrls, keepBuildDirectory, manualHtml, logging } = options;
  if (!fs.existsSync('./topics')) throw 'There must be a topics directory present, try running "canopy init"';
  if (!fs.existsSync('./.canopy_default_topic')) throw 'There must be a default topic dotfile present, try running "canopy init"';

  let defaultTopicString = fs.readFileSync('.canopy_default_topic').toString().trim();
  let canopyLocation = process.env.CANOPY_LOCATION || path.dirname(path.dirname(fs.realpathSync(shell.which('canopy').stdout)));

  if (!keepBuildDirectory) fs.rmSync('build', { recursive: true, force: true });
  fs.rmSync('build/_data', { recursive: true, force: true });
  fs.ensureDirSync('build');

  if (!manualHtml) {
    let favicon = fs.existsSync(`assets/favicon.ico`);

    let html = dedent`
      <html>
      <head>
      ${favicon ? '<link rel="icon" type="image/x-icon" href="/_assets/favicon.ico">' : ''}
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

  if (fs.existsSync(`assets`)) {
    fs.copySync('assets', 'build/_assets', { overwrite: true });
  }

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
      if (!fs.existsSync(`build/${currentTopicDirectory}/_assets`)) {
        fs.symlinkSync(`build/_assets`, `build/${currentTopicDirectory}/_assets`);
      }
    });
  }

  if (!fs.existsSync(`${canopyLocation}/dist/canopy.js`)) {
    throw 'No Canopy.js asset found';
  }

  fs.copyFileSync(`${canopyLocation}/dist/canopy.js`, 'build/canopy.js');

  if (fs.existsSync(`${canopyLocation}/dist/canopy.js.map`)) {
    fs.copyFileSync(`${canopyLocation}/dist/canopy.js.map`, 'build/canopy.js.map');
  }

  console.log(`Built at: ${'' + new Date()}`);
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync( path + '/' + file).isDirectory() && !file.startsWith('_');
  });
}

module.exports = build;