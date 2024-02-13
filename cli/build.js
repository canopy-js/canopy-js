const fs = require('fs-extra');
const path = require('path');
const dedent = require('dedent-js');
const shell = require('shelljs');
const buildProject = require('./build/build_project');
let chalk = require('chalk');
let { DefaultTopic, canopyLocation, tryAndWriteHtmlError } = require('./shared/fs-helpers');
let Topic = require('./shared/topic');

function build(options = {}) {
  let { symlinks, projectPathPrefix, hashUrls, keepBuildDirectory, manualHtml, logging } = options;
  let defaultTopic = new DefaultTopic();
  if (!fs.existsSync('./topics')) throw new Error('There must be a topics directory present, try running "canopy init"');

  if (!keepBuildDirectory) {
    fs.rmSync('build', { recursive: true, force: true });
    fs.rmSync('build/_data', { recursive: true, force: true });
  }

  fs.ensureDirSync('build');

  if (!manualHtml) {
    let favicon = fs.existsSync(`assets/favicon.ico`);
    let customCss = fs.existsSync(`assets/custom.css`);
    let customHtmlHead = fs.existsSync(`assets/head.html`) && fs.readFileSync(`assets/head.html`);
    let customHtmlNav = fs.existsSync(`assets/nav.html`) && fs.readFileSync(`assets/nav.html`);
    let customHtmlFooter = fs.existsSync(`assets/footer.html`) && fs.readFileSync(`assets/footer.html`);

    let html = dedent`
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="utf-8">` +
      dedent`${customCss ? `<link rel="stylesheet" href="${projectPathPrefix ? '/' + projectPathPrefix :''}/_assets/custom.css">\n` : ''}` + // async loading
      dedent`<script src="${projectPathPrefix ? '/' + projectPathPrefix :''}/_canopy.js" defer></script>` + "\n" + // we want custom css to have loaded before table list size eval
      dedent`${favicon ? `<link rel="icon" type="image/x-icon" href="${projectPathPrefix ? '/' + projectPathPrefix :''}/_assets/favicon.ico">\n` : ''}` +
      dedent`<link rel="prefetch" href="${projectPathPrefix ? '/' + projectPathPrefix :''}/_data/${defaultTopic.fileName}.json" as="fetch" crossorigin="anonymous" fetchpriority="low">` + '\n' +
      dedent`${customHtmlHead ? customHtmlHead : ''}` +
      dedent`</head>
      <body>\n` +
      dedent`${customHtmlNav ? customHtmlNav : ''}` +
      dedent`<div
        id="_canopy"
        data-default-topic="${defaultTopic.name}"
        data-default-topic-mixed-case="${Topic.for(defaultTopic.name).mixedCase}"
        data-project-path-prefix="${projectPathPrefix||''}"
        data-hash-urls="${hashUrls || ''}">
      </div>\n` +
      dedent`${customHtmlFooter ? customHtmlFooter : ''}` +
      dedent`</body>
      </html>\n`;

    fs.writeFileSync('build/index.html', html);
  }

  if (options.logging) console.log(chalk.cyan(
    `Canopy build: Rebuilding JSON at ${''
    + (new Date()).toLocaleTimeString()} (pid ${process.pid})`
    + (options.filesEdited ? ` – file changed: ${options.filesEdited}` : '')
  ));

  if (fs.existsSync(`assets`) && !options.keepBuildDirectory) {
    fs.rmSync('build/_assets', { recursive: true, force: true });
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
    throw new Error(chalk.red('No Canopy.js asset found'));
  }

  fs.copyFileSync(`${canopyLocation}/dist/canopy.js`, 'build/_canopy.js');

  if (fs.existsSync(`${canopyLocation}/dist/_canopy.js.map`)) {
    fs.copyFileSync(`${canopyLocation}/dist/_canopy.js.map`, 'build/_canopy.js.map');
  }

  if (options.cache && options.logging) console.log(chalk.magenta('Cache option enabled: First pass for new expl files:'));
  tryAndWriteHtmlError(() => buildProject(defaultTopic.name, options), options); // if cache, do a quick build of changed expl only
  if (options.cache && options.logging) console.log(chalk.magenta('Cache option enabled: Second pass for all expl files:'));
  if (options.cache && options.logging) tryAndWriteHtmlError(() => buildProject(defaultTopic.name, { ...options, cache: false }), options); // then do all

  if (options.logging) console.log(chalk.cyan(`Canopy build: build finished at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid})`));
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync( path + '/' + file).isDirectory() && !file.startsWith('_');
  });
}

module.exports = build;
