const fs = require('fs-extra');
const dedent = require('dedent-js');
const buildProject = require('./build/build_project');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
let chalk = require('chalk');
let { DefaultTopic, canopyLocation, tryAndWriteHtmlError } = require('./shared/fs-helpers');
let { killActiveFullBuildProcesses } = require('./shared/full_build_processes');
let { buildRoot, staticBuildDirectory, singleFileBuildDirectory, staticBuildPath, singleFileBuildPath } = require('./shared/build_paths');
let Topic = require('./shared/topic');
let os = require('os');

function build(options = {}) {
  let { symlinks, projectPathPrefix, hashUrls, manualHtml, logging, replaceBuildDirectory } = options;
  const buildStart = Date.now();
  let defaultTopic = new DefaultTopic();
  if (!fs.existsSync('./topics')) throw new Error('There must be a topics directory present, try running "canopy init"');

  if (replaceBuildDirectory) {
    fs.rmSync(buildRoot, { recursive: true, force: true });
  }

  fs.ensureDirSync(staticBuildDirectory);
  removeLegacyStaticBuildFiles();

  refreshAssetsDirectory();

  if (!fs.existsSync(`${canopyLocation}/dist/_canopy.js`)) {
    throw new Error(chalk.red('No Canopy.js asset found'));
  }

  fs.copyFileSync(`${canopyLocation}/dist/_canopy.js`, staticBuildPath('_canopy.js'));

  if (fs.existsSync(`${canopyLocation}/dist/_canopy.js.map`)) {
    fs.copyFileSync(`${canopyLocation}/dist/_canopy.js.map`, staticBuildPath('_canopy.js.map'));
  }

  if (!options.skipInitialBuild) {
    if (options.logging) console.log(chalk.cyan(
      `Canopy build: Rebuilding JSON at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid})`
      + (options.filesEdited ? ` – file changed: ${options.filesEdited}` : '')
    ));

    if (options.cache && options.logging) console.log(chalk.magenta('Cache option enabled: First pass for new expl files:'));
    tryAndWriteHtmlError(() => buildProject(defaultTopic.name, options), options); // always build first, if cache, only edited expl files
    writeIndexHtml({ projectPathPrefix, hashUrls, manualHtml, defaultTopic, logging: options.logging });

    if (options.cache && options.logging) console.log(chalk.magenta('Cache option enabled: Second pass for all expl files:'));
    if (options.cache && !options.deferFullBuild) {
      runFullBuildInChild(options);
    }

    if (options.logging) {
      const elapsedSeconds = ((Date.now() - buildStart) / 1000).toFixed(1);
      console.log(chalk.cyan(`Canopy build: build finished at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid}) in ${elapsedSeconds}s`));
    }

    if (options.file) writeSingleFileHtml({ projectPathPrefix, hashUrls, defaultTopic, options });
  }

  if (symlinks) {
    let topicDirectories = getDirectories(staticBuildDirectory);
    topicDirectories.forEach((currentTopicDirectory) => {
      topicDirectories.forEach((targetTopicDirectory) => {
        if (logging) console.log(`Creating symlink from ${targetTopicDirectory} to ${currentTopicDirectory}`);
        fs.copyFileSync(staticBuildPath('index.html'), staticBuildPath(currentTopicDirectory, 'index.html'));
        if (!fs.existsSync(staticBuildPath(currentTopicDirectory, targetTopicDirectory))) {
          fs.symlinkSync(staticBuildPath(targetTopicDirectory), staticBuildPath(currentTopicDirectory, targetTopicDirectory));
        }
      });
      if (!fs.existsSync(staticBuildPath(currentTopicDirectory, '_assets'))) {
        fs.symlinkSync(staticBuildPath('_assets'), staticBuildPath(currentTopicDirectory, '_assets'));
      }
    });
  }

  if (options.skipInitialBuild) console.log(chalk.gray('Skipping JSON generation ' + (options.filesEdited ? `(file edited: ${options.filesEdited})` : '(initial build)')));
}

function runFullBuildInChild(options) {
  killActiveFullBuildProcesses();

  const childOptions = {
    ...options,
    cache: false,
    replaceBuildDirectory: false
  };

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, 'build', 'run_background_full_build.js'), JSON.stringify(childOptions)],
    {
      cwd: process.cwd(),
      stdio: 'inherit'
    }
  );

  if (result.error) throw result.error;
  if (result.signal === 'SIGTERM') return;
  if (result.status) throw new Error(`Background full build exited with status ${result.status}`);
}

function refreshAssetsDirectory() {
  if (fs.existsSync('assets')) {
    fs.copySync('assets', staticBuildPath('_assets'), {
      overwrite: true,
      filter: (source) => !isSkippableAssetMetadataFile(source)
    });
  }
}

function removeLegacyStaticBuildFiles() {
  [
    'index.html',
    '_canopy.js',
    '_canopy.js.map',
    '_data',
    '_assets',
    '_file'
  ].forEach(filePath => fs.rmSync(path.join(buildRoot, filePath), { recursive: true, force: true }));
}

function isSkippableAssetMetadataFile(filePath) {
  const filename = path.basename(filePath);
  const lower = filename.toLowerCase();

  return (
    filename === '.DS_Store' ||
    filename.startsWith('._') ||
    lower === 'thumbs.db' ||
    lower === 'desktop.ini'
  );
}

function bootLoaderStyle() {
  return dedent`<style>
  #_canopy > .canopy-boot-loading-graphic {
    align-items: stretch;
    animation: canopy-boot-loading-reveal 1ms linear 150ms forwards;
    display: flex;
    flex-direction: column;
    gap: 13px;
    justify-content: center;
    margin: 10px auto 0;
    max-width: 594px;
    min-height: 180px;
    opacity: 0;
    padding: 22px 30px;
    position: relative;
    width: min(64.8vw, 594px);
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line {
    animation: canopy-boot-loading-line-shimmer 2400ms ease-in-out infinite alternate;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.24), rgba(0, 0, 0, 0.03));
    background-size: 320% 100%;
    border-radius: 999px;
    display: block;
    filter: blur(2.4px);
    height: 18px;
    opacity: 0.74;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-heading-line {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.035), rgba(0, 0, 0, 0.42), rgba(0, 0, 0, 0.035));
    filter: blur(3.8px);
    height: 32px;
    margin: 0 auto 8px;
    width: 68%;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(2) {
    width: 84%;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(3) {
    animation-delay: 130ms;
    width: 96%;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(4) {
    animation-delay: 260ms;
    width: 62%;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(5) {
    animation-delay: 390ms;
    width: 74%;
  }

  @keyframes canopy-boot-loading-reveal {
    to { opacity: 1; }
  }

  @keyframes canopy-boot-loading-line-shimmer {
    from { background-position: 120% 0; opacity: 0.58; }
    to { background-position: -20% 0; opacity: 0.72; }
  }
  </style>
  `;
}

function bootLoaderHtml() {
  return dedent`<div class="canopy-loading-graphic canopy-boot-loading-graphic" aria-hidden="true">
      <span class="canopy-loading-line canopy-loading-heading-line"></span>
      <span class="canopy-loading-line"></span>
      <span class="canopy-loading-line"></span>
      <span class="canopy-loading-line"></span>
      <span class="canopy-loading-line"></span>
    </div>`;
}

function writeIndexHtml({ projectPathPrefix, hashUrls, manualHtml, defaultTopic, logging }) {
  if (manualHtml) return;

  const favicon = fs.existsSync(`assets/favicon.ico`);
  const customCss = fs.existsSync(`assets/custom.css`) && fs.readFileSync(`assets/custom.css`);
  const customJs = fs.existsSync(`assets/custom.js`) && fs.readFileSync(`assets/custom.js`);
  const customHtmlHead = fs.existsSync(`assets/head.html`) && fs.readFileSync(`assets/head.html`);
  const customHtmlNav = fs.existsSync(`assets/nav.html`) && fs.readFileSync(`assets/nav.html`);
  const customHtmlFooter = fs.existsSync(`assets/footer.html`) && fs.readFileSync(`assets/footer.html`);
  const defaultTopicJson = fs.readFileSync(staticBuildPath('_data', `${defaultTopic.jsonFileName}.json`));

  const html = dedent`
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">` +
    bootLoaderStyle() +
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
      ${bootLoaderHtml()}
    </div>\n` +
    dedent`<script type="application/json" id="canopy_default_topic_json" data-topic-json="${defaultTopic.jsonFileName}.json">\n${defaultTopicJson}\n</script>\n` +
    dedent`${customHtmlFooter ? customHtmlFooter : ''}` +
    dedent`</body>
    </html>\n`;

  fs.writeFileSync(staticBuildPath('index.html'), html);
  if (logging) console.log(chalk.yellow(`Wrote to ${staticBuildPath('index.html')} at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid})`));
}

function writeSingleFileHtml({ projectPathPrefix, hashUrls, defaultTopic, options }) {
  const favicon = fs.existsSync(`assets/favicon.ico`);
  const customCss = fs.existsSync(`assets/custom.css`) && fs.readFileSync(`assets/custom.css`, 'utf8');
  const customJs = fs.existsSync(`assets/custom.js`) && fs.readFileSync(`assets/custom.js`, 'utf8');
  const customJsEscaped = customJs && customJs.replace(/<\/script/gi, '<\\/script');
  const customHtmlHead = fs.existsSync(`assets/head.html`) && fs.readFileSync(`assets/head.html`, 'utf8');
  const customHtmlNav = fs.existsSync(`assets/nav.html`) && fs.readFileSync(`assets/nav.html`, 'utf8');
  const customHtmlFooter = fs.existsSync(`assets/footer.html`) && fs.readFileSync(`assets/footer.html`, 'utf8');
  const defaultTopicJson = fs.readFileSync(staticBuildPath('_data', `${defaultTopic.jsonFileName}.json`), 'utf8');
  const canopyJs = fs.readFileSync(staticBuildPath('_canopy.js'), 'utf8').replace(/<\/script/gi, '<\\/script');

  const assetMap = buildAssetDataUriMap();
  const remoteAssetCache = {};
  const inlineAssetsInString = (string) => {
    if (!string) return string;
    const asString = typeof string === 'string' ? string : string.toString('utf8');
    const withLocalAssets = asString.replace(/((?:\.\.?\/|\/)?_assets\/[^"'\\)\s]+)/g, (match) => {
      const replacement = assetMap[normalizeAssetKey(match)] || match;
      return replacement.replace(/^\/(?=data:)/, ''); // strip leading slash if present on data URIs
    });

    return inlineRemoteAssetsInString(withLocalAssets, remoteAssetCache, options.logging);
  };

  const dataDir = staticBuildPath('_data');
  const jsonScripts = fs.readdirSync(dataDir)
    .filter(filePath => filePath.endsWith('.json'))
    .map(filePath => {
      const contents = fs.readFileSync(path.join(dataDir, filePath), 'utf8');
      const inlined = inlineAssetsInString(contents).replace(/<\/script/gi, '<\\/script');
      return `<script type="application/json" data-topic-json="${filePath}">\n${inlined}\n</script>`;
    }).join('\n');

  const singleFileDir = singleFileBuildDirectory;
  fs.ensureDirSync(singleFileDir);

  const outputPath = typeof options.file === 'string'
    ? (path.isAbsolute(options.file) ? options.file : singleFileBuildPath(options.file))
    : singleFileBuildPath(`${defaultTopic.topicFileName}.html`);

  const html = dedent`
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${bootLoaderStyle()}
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
      ${bootLoaderHtml()}
    </div>
    <script type="application/json" id="canopy_default_topic_json" data-topic-json="${defaultTopic.jsonFileName}.json">\n${inlineAssetsInString(defaultTopicJson).replace(/<\/script/gi, '<\\/script')}\n</script>
    ${jsonScripts}
    ${customHtmlFooter ? inlineAssetsInString(customHtmlFooter) : ''}
    <script>
    ${canopyJs}
    </script>
    </body>
    </html>\n`;

  fs.writeFileSync(outputPath, html);
  if (options.logging) console.log(chalk.hex('#FFA500')(`Wrote single-file HTML to ${outputPath} at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid})`));
}

function buildAssetDataUriMap() {
  const assetsRoot = staticBuildPath('_assets');
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
  const mime = mimeTypeForPath(filePath);
  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

function inlineRemoteAssetsInString(string, remoteAssetCache, logging) {
  return string
    .replace(/(<img\s[^>]*?src=\\?["'])(https?:\/\/[^"']+?)(\\?["'])/g, (match, prefix, url, suffix) => {
      return `${prefix}${fetchRemoteAssetAsDataUri(url, remoteAssetCache, logging)}${suffix}`;
    })
    .replace(/("resourceUrl":\s*")((?:https?:\/\/)[^"]+?)(")/g, (match, prefix, url, suffix) => {
      return `${prefix}${fetchRemoteAssetAsDataUri(url, remoteAssetCache, logging)}${suffix}`;
    })
    .replace(/(url\((?:\\?["'])?)(https?:\/\/[^)"']+?)((?:\\?["'])?\))/g, (match, prefix, url, suffix) => {
      return `${prefix}${fetchRemoteAssetAsDataUri(url, remoteAssetCache, logging)}${suffix}`;
    });
}

function fetchRemoteAssetAsDataUri(url, remoteAssetCache, logging) {
  if (remoteAssetCache[url]) return remoteAssetCache[url];

  const candidateUrls = [url, originalWikimediaAssetUrl(url)].filter((candidate, index, array) =>
    candidate && array.indexOf(candidate) === index
  );

  for (let candidateUrl of candidateUrls) {
    let tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-remote-asset-'));
    let tempFilePath = path.join(tempDir, 'asset');

    try {
      let contentType = execFileSync(
        'curl',
        ['-L', '--fail', '--silent', '--show-error', '--output', tempFilePath, '--write-out', '%{content_type}', candidateUrl],
        { encoding: 'utf8' }
      ).trim();

      const data = fs.readFileSync(tempFilePath);
      const mime = contentType || mimeTypeForPath(new URL(candidateUrl).pathname);
      const dataUri = `data:${mime};base64,${data.toString('base64')}`;
      remoteAssetCache[url] = dataUri;
      return dataUri;
    } catch (_error) {
      continue;
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  if (logging) console.warn(chalk.yellow(`Could not inline remote asset for single-file build: ${url}`));
  remoteAssetCache[url] = url;
  return url;
}

function originalWikimediaAssetUrl(url) {
  const match = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/thumb\/(.+?)\/[^/]+$/);
  if (!match) return null;

  return `${match[1]}/${match[2]}`;
}

function mimeTypeForPath(filePath) {
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

  return mimeTypes[ext] || 'application/octet-stream';
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
