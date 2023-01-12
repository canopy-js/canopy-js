const fs = require('fs-extra');
const path = require('path');
const dedent = require('dedent-js');
const shell = require('shelljs');
const buildProject = require('./build/build_project');
let chalk = require('chalk');
let { getDefaultTopicAndPath, canopyLocation } = require('./shared/helpers');

function build(options) {
  let { symlinks, projectPathPrefix, hashUrls, keepBuildDirectory, manualHtml, logging } = options;
  let { defaultTopicFilePath, defaultTopicName } = getDefaultTopicAndPath();
  if (!fs.existsSync('./topics')) throw new Error('There must be a topics directory present, try running "canopy init"');

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
        data-default-topic="${defaultTopicName}"
        data-project-path-prefix="${projectPathPrefix||''}"
        data-hash-urls="${hashUrls || ''}">
      </div>
      <script src="${projectPathPrefix||''}/_canopy.js"></script>
      <style>
        @font-face {
            font-family: 'FreeSerif';
            src: url('/_FreeSerif.woff2') format('woff2'),
                url('/_FreeSerif.woff') format('woff');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: 'FreeSerif';
            src: url('/_FreeSerifBoldItalic.woff2') format('woff2'),
                url('/_FreeSerifBoldItalic.woff') format('woff');
            font-weight: bold;
            font-style: italic;
            font-display: swap;
        }

        @font-face {
            font-family: 'FreeSerif';
            src: url('/_FreeSerifBold.woff2') format('woff2'),
                url('/_FreeSerifBold.woff') format('woff');
            font-weight: bold;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: 'FreeSerif';
            src: url('/_FreeSerifItalic.woff2') format('woff2'),
                url('/_FreeSerifItalic.woff') format('woff');
            font-weight: normal;
            font-style: italic;
            font-display: swap;
        }

        #_canopy p {
          font-family: FreeSerif, serif;
        }
      </style>
      <link rel="preload" href="/_FreeSerif.woff2" as="font" type="font/woff2" crossorigin>
      <link rel="preload" href="/_FreeSerifItalic.woff2" as="font" type="font/woff2" crossorigin>
      <link rel="preload" href="/_FreeSerifBold.woff2" as="font" type="font/woff2" crossorigin>
      <link rel="preload" href="/_FreeSerifBoldItalic.woff2" as="font" type="font/woff2" crossorigin>
      </body>
      </html>`;

    fs.writeFileSync('build/index.html', html);
  }

  if (options.logging) console.log(chalk.cyan(
    `Canopy build: Rebuilding JSON at ${''
    + (new Date()).toLocaleTimeString()} (pid ${process.pid})`
    + (options.filesEdited ? ` – file changed: ${options.filesEdited}` : '')
  ));

  buildProject(defaultTopicName, options);

  if (fs.existsSync(`assets`)) {
    fs.copySync('assets', 'build/_assets', { overwrite: true });
  }

  fs.copySync(`${canopyLocation}/cli/commands/build/assets`, 'build/');

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
    throw new Error(chalk.red('No Canopy.js asset found'));
  }

  fs.copyFileSync(`${canopyLocation}/dist/canopy.js`, 'build/_canopy.js');

  if (fs.existsSync(`${canopyLocation}/dist/_canopy.js.map`)) {
    fs.copyFileSync(`${canopyLocation}/dist/_canopy.js.map`, 'build/_canopy.js.map');
  }

  if (options.logging) console.log(chalk.cyan(`Canopy build: build finished at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid})`));
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync( path + '/' + file).isDirectory() && !file.startsWith('_');
  });
}

module.exports = build;
