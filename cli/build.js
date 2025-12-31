const fs = require('fs-extra');
const dedent = require('dedent-js');
const buildProject = require('./build/build_project');
let chalk = require('chalk');
let { DefaultTopic, canopyLocation, tryAndWriteHtmlError } = require('./shared/fs-helpers');
let Topic = require('./shared/topic');
let path = require('path');

function build(options = {}) {
  let { symlinks, projectPathPrefix, hashUrls, keepBuildDirectory, manualHtml, logging } = options;
  let defaultTopic = new DefaultTopic();
  if (!fs.existsSync('./topics')) throw new Error('There must be a topics directory present, try running "canopy init"');

  if (!keepBuildDirectory) {
    fs.rmSync('build', { recursive: true, force: true });
    fs.rmSync('build/_data', { recursive: true, force: true });
  }

  fs.ensureDirSync('build');

  if (fs.existsSync(`assets`) && !options.keepBuildDirectory) {
    fs.rmSync('build/_assets', { recursive: true, force: true });
    fs.copySync('assets', 'build/_assets', { overwrite: true });
  }

  if (!fs.existsSync(`${canopyLocation}/dist/_canopy.js`)) {
    throw new Error(chalk.red('No Canopy.js asset found'));
  }

  fs.copyFileSync(`${canopyLocation}/dist/_canopy.js`, 'build/_canopy.js');

  if (fs.existsSync(`${canopyLocation}/dist/_canopy.js.map`)) {
    fs.copyFileSync(`${canopyLocation}/dist/_canopy.js.map`, 'build/_canopy.js.map');
  }

  if (!options.skipInitialBuild) {
    if (options.logging) console.log(chalk.cyan(
      `Canopy build: Rebuilding JSON at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid})`
      + (options.filesEdited ? ` – file changed: ${options.filesEdited}` : '')
    ));

    if (options.cache && options.logging) console.log(chalk.magenta('Cache option enabled: First pass for new expl files:'));
    tryAndWriteHtmlError(() => buildProject(defaultTopic.name, options), options); // always build first, if cache, only edited expl files
    writeIndexHtml({ projectPathPrefix, hashUrls, manualHtml, defaultTopic });

    if (options.cache && options.logging) console.log(chalk.magenta('Cache option enabled: Second pass for all expl files:'));
    if (options.cache) tryAndWriteHtmlError(() => buildProject(defaultTopic.name, { ...options, cache: false }), options);
    if (options.logging) console.log(chalk.cyan(`Canopy build: build finished at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid})`));
    if (options.file) writeSingleFileHtml({ projectPathPrefix, hashUrls, defaultTopic, options });
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

  if (options.skipInitialBuild) console.log(chalk.gray('Skipping JSON generation ' + (options.filesEdited ? `(file edited: ${options.filesEdited})` : '(initial build)')));
}

function writeIndexHtml({ projectPathPrefix, hashUrls, manualHtml, defaultTopic }) {
  if (manualHtml) return;

  const favicon = fs.existsSync(`assets/favicon.ico`);
  const customCss = fs.existsSync(`assets/custom.css`) && fs.readFileSync(`assets/custom.css`);
  const customJs = fs.existsSync(`assets/custom.js`) && fs.readFileSync(`assets/custom.js`);
  const customHtmlHead = fs.existsSync(`assets/head.html`) && fs.readFileSync(`assets/head.html`);
  const customHtmlNav = fs.existsSync(`assets/nav.html`) && fs.readFileSync(`assets/nav.html`);
  const customHtmlFooter = fs.existsSync(`assets/footer.html`) && fs.readFileSync(`assets/footer.html`);
  const defaultTopicJson = fs.readFileSync(`build/_data/${defaultTopic.jsonFileName}.json`);

  const html = dedent`
    <!DOCTYPE html>
    <html>
    <head>
    <script type="application/json" id="canopy_default_topic_json" data-topic-json="${defaultTopic.jsonFileName}.json">\n${defaultTopicJson}\n</script>
    <meta charset="utf-8">` +
    dedent`${customCss ? `<style>\n${fs.readFileSync(`assets/custom.css`)}\n</style>` : ''}` +
    dedent`${customJs ? `<script>\n${fs.readFileSync(`assets/custom.js`)}\n</script>` : ''}` +
    dedent`<script src="${projectPathPrefix ? '/' + projectPathPrefix : ''}/_canopy.js" defer></script>\n` +
    dedent`${favicon ? `<link rel="icon" type="image/x-icon" href="${projectPathPrefix ? '/' + projectPathPrefix : ''}/_assets/favicon.ico">\n` : ''}` +
    dedent`${customHtmlHead ? customHtmlHead : ''}` +
    dedent`</head>
    <body>\n` +
    dedent`${customHtmlNav ? customHtmlNav : ''}` +
    dedent`<div
      id="_canopy"
      data-default-topic-mixed-case="${Topic.for(defaultTopic.name).mixedCase}"
      data-default-topic="${defaultTopic.name}"
      data-project-path-prefix="${projectPathPrefix||''}"
      data-hash-urls="${hashUrls || ''}">
    </div>\n` +
    dedent`${customHtmlFooter ? customHtmlFooter : ''}` +
    dedent`</body>
    </html>\n`;

  fs.writeFileSync('build/index.html', html);
  console.log(chalk.yellow(`Wrote to index.html at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid})`));
}

function writeSingleFileHtml({ projectPathPrefix, hashUrls, defaultTopic, options }) {
  const favicon = fs.existsSync(`assets/favicon.ico`);
  const customCss = fs.existsSync(`assets/custom.css`) && fs.readFileSync(`assets/custom.css`, 'utf8');
  const customJs = fs.existsSync(`assets/custom.js`) && fs.readFileSync(`assets/custom.js`, 'utf8');
  const customJsEscaped = customJs && customJs.replace(/<\/script/gi, '<\\/script');
  const customHtmlHead = fs.existsSync(`assets/head.html`) && fs.readFileSync(`assets/head.html`, 'utf8');
  const customHtmlNav = fs.existsSync(`assets/nav.html`) && fs.readFileSync(`assets/nav.html`, 'utf8');
  const customHtmlFooter = fs.existsSync(`assets/footer.html`) && fs.readFileSync(`assets/footer.html`, 'utf8');
  const defaultTopicJson = fs.readFileSync(`build/_data/${defaultTopic.jsonFileName}.json`, 'utf8');
  const canopyJs = fs.readFileSync('build/_canopy.js', 'utf8').replace(/<\/script/gi, '<\\/script');

  const assetMap = buildAssetDataUriMap();
  const inlineAssetsInString = (string) => {
    if (!string) return string;
    const asString = typeof string === 'string' ? string : string.toString('utf8');
    return asString.replace(/((?:\.\.?\/|\/)?_assets\/[^"'\\)\s]+)/g, (match) => {
      const replacement = assetMap[normalizeAssetKey(match)] || match;
      return replacement.replace(/^\/(?=data:)/, ''); // strip leading slash if present on data URIs
    });
  };

  const dataDir = 'build/_data';
  const jsonScripts = fs.readdirSync(dataDir)
    .filter(filePath => filePath.endsWith('.json'))
    .map(filePath => {
      const contents = fs.readFileSync(path.join(dataDir, filePath), 'utf8');
      const inlined = inlineAssetsInString(contents).replace(/<\/script/gi, '<\\/script');
      return `<script type="application/json" data-topic-json="${filePath}">\n${inlined}\n</script>`;
    }).join('\n');

  const singleFileDir = path.join('build', '_file');
  fs.ensureDirSync(singleFileDir);

  const outputPath = typeof options.file === 'string'
    ? (path.isAbsolute(options.file) ? options.file : path.join('build', options.file))
    : path.join(singleFileDir, `${defaultTopic.topicFileName}.html`);

  const html = dedent`
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <script type="application/json" id="canopy_default_topic_json" data-topic-json="${defaultTopic.jsonFileName}.json">\n${inlineAssetsInString(defaultTopicJson).replace(/<\/script/gi, '<\\/script')}\n</script>
    ${jsonScripts}
    ${customCss ? `<style>\n${inlineAssetsInString(customCss)}\n</style>` : ''}
    ${customJsEscaped ? `<script>\n${inlineAssetsInString(customJsEscaped)}\n</script>` : ''}
    ${favicon ? `<link rel="icon" type="image/x-icon" href="data:application/octet-stream;base64,${fs.readFileSync('assets/favicon.ico').toString('base64')}">\n` : ''}
    ${customHtmlHead ? inlineAssetsInString(customHtmlHead) : ''}
    </head>
    <body>
    ${customHtmlNav ? inlineAssetsInString(customHtmlNav) : ''}
    <div
      id="_canopy"
      data-default-topic-mixed-case="${Topic.for(defaultTopic.name).mixedCase}"
      data-default-topic="${defaultTopic.name}"
      data-project-path-prefix="${projectPathPrefix||''}"
      data-hash-urls="${hashUrls || ''}">
    </div>
    ${customHtmlFooter ? inlineAssetsInString(customHtmlFooter) : ''}
    <script>
    ${canopyJs}
    </script>
    </body>
    </html>\n`;

  fs.writeFileSync(outputPath, html);
  console.log(chalk.hex('#FFA500')(`Wrote single-file HTML to ${outputPath} at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid})`));
}

function buildAssetDataUriMap() {
  const assetsRoot = 'build/_assets';
  if (!fs.existsSync(assetsRoot)) return {};

  const map = {};

  function walk(dir) {
    fs.readdirSync(dir).forEach(name => {
      const fullPath = path.join(dir, name);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        const rel = path.relative(assetsRoot, fullPath).split(path.sep).join('/');
        const key = `_assets/${rel}`;
        const uri = toDataUri(fullPath);
        map[key] = uri;
        map[`/${key}`] = uri;
        map[key.replace(/^_/, '')] = uri;
      }
    });
  }

  walk(assetsRoot);
  return map;
}

function toDataUri(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4'
  };
  const mime = mimeTypes[ext] || 'application/octet-stream';
  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

function normalizeAssetKey(key) {
  return key
    .replace(/^\.\/+/, '')  // remove leading ./ 
    .replace(/^\/+/, '/');  // collapse leading slashes
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync( path + '/' + file).isDirectory() && !file.startsWith('_');
  });
}

module.exports = build;
