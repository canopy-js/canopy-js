const fs = require('fs-extra');
const dedent = require('dedent-js');
const buildProject = require('./build/build_project');
const path = require('path');
const { constants: bufferConstants } = require('buffer');
const { spawnSync, execFileSync } = require('child_process');
let chalk = require('chalk');
let { DefaultTopic, canopyLocation, tryAndWriteHtmlError } = require('./shared/fs-helpers');
let { killActiveFullBuildProcesses } = require('./shared/full_build_processes');
let {
  buildRoot,
  offlineAssetsDirectory,
  staticBuildDirectory,
  singleFileBuildDirectory,
  staticBuildPath,
  singleFileBuildPath
} = require('./shared/build_paths');
let Topic = require('./shared/topic');
let os = require('os');

const DATA_URI_SIZE_SAFETY_MARGIN = 1024;
const MAX_BASE64_ASSET_BYTES = Math.floor(
  (bufferConstants.MAX_STRING_LENGTH - DATA_URI_SIZE_SAFETY_MARGIN) / 4
) * 3;

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
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: flex-start;
    left: 50%;
    margin: 0;
    max-width: 594px;
    min-height: 180px;
    opacity: 0;
    padding: 0 30px 22px;
    pointer-events: none;
    position: fixed;
    top: 44px;
    transform: translateX(-50%);
    width: min(64.8vw, 594px);
    z-index: 1;
  }

  #_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-visible {
    opacity: 1;
  }

  #_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-fading-out {
    animation: canopy-boot-loading-fade-out 165ms ease forwards;
  }

  #_canopy > .canopy-boot-loading-graphic:not(.canopy-boot-loading-graphic-fading-out) ~ section.canopy-section {
    opacity: 0 !important;
    pointer-events: none;
  }

  #_canopy > h1.canopy-header + .canopy-boot-loading-graphic + section.canopy-topic-section {
    margin-top: 30px;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line {
    --canopy-boot-loading-line-base-opacity: 0.14;
    --canopy-boot-loading-line-delay: 0ms;
    --canopy-boot-loading-line-duration: 3200ms;
    --canopy-boot-loading-line-middle-opacity: 0.74;
    --canopy-boot-loading-line-shoulder-opacity: 0.16;
    --canopy-boot-loading-line-start: -46%;
    --canopy-boot-loading-line-stop: 44%;
    --canopy-boot-loading-line-sweep: 65%;
    background: rgba(0, 0, 0, var(--canopy-boot-loading-line-base-opacity));
    border-radius: 999px;
    display: block;
    filter: blur(2.9px);
    height: 24px;
    opacity: 0.74;
    overflow: hidden;
    position: relative;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line::after {
    animation: canopy-boot-loading-line-shimmer var(--canopy-boot-loading-line-duration) cubic-bezier(0.45, 0, 0.55, 1) infinite;
    animation-delay: var(--canopy-boot-loading-line-delay);
    background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.06) 34%, rgba(0, 0, 0, 0.18) 50%, rgba(0, 0, 0, 0.06) 66%, rgba(0, 0, 0, 0) 100%);
    content: '';
    inset: -40% calc(-1 * var(--canopy-boot-loading-line-sweep));
    position: absolute;
    transform: translateX(var(--canopy-boot-loading-line-start));
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-heading-line {
    background: rgba(0, 0, 0, 0.2);
    filter: blur(3.8px);
    height: 32px;
    margin: 0 auto 15px;
    width: 68%;
  }

  #_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep {
    gap: 22px;
    padding-top: 42px;
  }

  #_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep > .canopy-loading-heading-line {
    display: none;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(2) {
    --canopy-boot-loading-line-base-opacity: 0.135;
    --canopy-boot-loading-line-delay: -520ms;
    --canopy-boot-loading-line-duration: 3400ms;
    --canopy-boot-loading-line-middle-opacity: 0.68;
    --canopy-boot-loading-line-shoulder-opacity: 0.14;
    --canopy-boot-loading-line-start: -44%;
    --canopy-boot-loading-line-stop: 40%;
    --canopy-boot-loading-line-sweep: 58%;
    margin-left: -9%;
    width: 110%;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(3) {
    --canopy-boot-loading-line-base-opacity: 0.15;
    --canopy-boot-loading-line-delay: -1180ms;
    --canopy-boot-loading-line-duration: 2950ms;
    --canopy-boot-loading-line-middle-opacity: 0.82;
    --canopy-boot-loading-line-shoulder-opacity: 0.2;
    --canopy-boot-loading-line-start: -56%;
    --canopy-boot-loading-line-stop: 48%;
    --canopy-boot-loading-line-sweep: 76%;
    margin-left: -9%;
    width: 105%;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(4) {
    --canopy-boot-loading-line-base-opacity: 0.125;
    --canopy-boot-loading-line-delay: -260ms;
    --canopy-boot-loading-line-duration: 3950ms;
    --canopy-boot-loading-line-middle-opacity: 0.58;
    --canopy-boot-loading-line-shoulder-opacity: 0.12;
    --canopy-boot-loading-line-start: -36%;
    --canopy-boot-loading-line-stop: 34%;
    --canopy-boot-loading-line-sweep: 50%;
    margin-left: -9%;
    width: 71%;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(5) {
    --canopy-boot-loading-line-base-opacity: 0.145;
    --canopy-boot-loading-line-delay: -1640ms;
    --canopy-boot-loading-line-duration: 3250ms;
    --canopy-boot-loading-line-middle-opacity: 0.72;
    --canopy-boot-loading-line-shoulder-opacity: 0.16;
    --canopy-boot-loading-line-start: -49%;
    --canopy-boot-loading-line-stop: 43%;
    --canopy-boot-loading-line-sweep: 64%;
    margin-left: -9%;
    width: 83%;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(6) {
    --canopy-boot-loading-line-base-opacity: 0.13;
    --canopy-boot-loading-line-delay: -910ms;
    --canopy-boot-loading-line-duration: 4300ms;
    --canopy-boot-loading-line-middle-opacity: 0.61;
    --canopy-boot-loading-line-shoulder-opacity: 0.12;
    --canopy-boot-loading-line-start: -40%;
    --canopy-boot-loading-line-stop: 47%;
    --canopy-boot-loading-line-sweep: 57%;
    margin-left: -9%;
    width: 97%;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(7) {
    --canopy-boot-loading-line-base-opacity: 0.155;
    --canopy-boot-loading-line-delay: -2230ms;
    --canopy-boot-loading-line-duration: 2850ms;
    --canopy-boot-loading-line-middle-opacity: 0.84;
    --canopy-boot-loading-line-shoulder-opacity: 0.21;
    --canopy-boot-loading-line-start: -60%;
    --canopy-boot-loading-line-stop: 41%;
    --canopy-boot-loading-line-sweep: 74%;
    margin-left: -9%;
    width: 66%;
  }

  #_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(n+6) {
    display: none;
  }

  #_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep > .canopy-loading-line:nth-of-type(4),
  #_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep > .canopy-loading-line:nth-of-type(6) {
    margin-top: 16px;
  }

  #_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep > .canopy-loading-line:nth-of-type(n+6) {
    display: block;
  }

  @keyframes canopy-boot-loading-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes canopy-boot-loading-line-shimmer {
    0% { opacity: 0; transform: translateX(var(--canopy-boot-loading-line-start)); }
    18% { opacity: var(--canopy-boot-loading-line-shoulder-opacity); }
    50% { opacity: var(--canopy-boot-loading-line-middle-opacity); transform: translateX(0); }
    82% { opacity: var(--canopy-boot-loading-line-shoulder-opacity); }
    100% { opacity: 0; transform: translateX(var(--canopy-boot-loading-line-stop)); }
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
      <span class="canopy-loading-line"></span>
      <span class="canopy-loading-line"></span>
    </div>`;
}

function bootLoaderScript() {
  return dedent`<script>
  (() => {
    const loader = document.querySelector('#_canopy > .canopy-boot-loading-graphic');
    if (!loader) return;
    if (window.location.protocol === 'file:') return;
    const hash = window.location.hash || '';
    const route = window.location.pathname + (hash.startsWith('#/') ? '' : hash);
    const pathSegments = route.split(/[\\/#]/).filter(Boolean);
    if (pathSegments.length >= 3) loader.classList.add('canopy-boot-loading-graphic-deep');
    window.setTimeout(() => {
      if (!loader.isConnected || loader.classList.contains('canopy-boot-loading-graphic-fading-out')) return;
      loader.dataset.canopyBootloaderVisibleAt = String(Date.now());
      loader.classList.add('canopy-boot-loading-graphic-visible');
    }, 150);
  })();
  </script>`;
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
    </div>
    ${bootLoaderScript()}\n` +
    dedent`<script type="application/json" id="canopy_default_topic_json" data-topic-json="${defaultTopic.jsonFileName}.json">\n${defaultTopicJson}\n</script>\n` +
    dedent`${customHtmlFooter ? customHtmlFooter : ''}` +
    dedent`</body>
    </html>\n`;

  fs.writeFileSync(staticBuildPath('index.html'), html);
  if (logging) console.log(chalk.yellow(`Wrote to ${staticBuildPath('index.html')} at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid})`));
}

function writeSingleFileHtml({ projectPathPrefix, hashUrls, defaultTopic, options }) {
  const maxBase64AssetBytes = options.maxBase64AssetBytes ?? MAX_BASE64_ASSET_BYTES;
  const favicon = fs.existsSync(`assets/favicon.ico`);
  const customCss = fs.existsSync(`assets/custom.css`) && fs.readFileSync(`assets/custom.css`, 'utf8');
  const customJs = fs.existsSync(`assets/custom.js`) && fs.readFileSync(`assets/custom.js`, 'utf8');
  const customJsEscaped = customJs && customJs.replace(/<\/script/gi, '<\\/script');
  const customHtmlHead = fs.existsSync(`assets/head.html`) && fs.readFileSync(`assets/head.html`, 'utf8');
  const customHtmlNav = fs.existsSync(`assets/nav.html`) && fs.readFileSync(`assets/nav.html`, 'utf8');
  const customHtmlFooter = fs.existsSync(`assets/footer.html`) && fs.readFileSync(`assets/footer.html`, 'utf8');
  const defaultTopicJson = fs.readFileSync(staticBuildPath('_data', `${defaultTopic.jsonFileName}.json`), 'utf8');
  const canopyJs = fs.readFileSync(staticBuildPath('_canopy.js'), 'utf8').replace(/<\/script/gi, '<\\/script');

  const assetMap = buildAssetDataUriMap(options.logging, maxBase64AssetBytes);
  const remoteAssetCache = {};
  const inlineAssetsInString = (string) => {
    if (!string) return string;
    const asString = typeof string === 'string' ? string : string.toString('utf8');
    const withLocalAssets = asString.replace(/((?:\.\.?\/|\/)?_assets\/[^"'\\)\s]+)/g, (match) => {
      const replacement = assetMap[normalizeAssetKey(match)] || match;
      return replacement.replace(/^\/(?=data:)/, ''); // strip leading slash if present on data URIs
    });

    return inlineRemoteAssetsInString(withLocalAssets, remoteAssetCache, options.logging, maxBase64AssetBytes);
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
    ${favicon ? `<link rel="icon" type="image/x-icon" href="${toDataUri('assets/favicon.ico', { displayName: '_assets/favicon.ico', logging: options.logging, maxBase64AssetBytes })}">\n` : ''}
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
    ${bootLoaderScript()}
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

function buildAssetDataUriMap(logging, maxBase64AssetBytes) {
  const map = {};

  function addDirectory(assetsRoot) {
    if (!fs.existsSync(assetsRoot)) return;

    walk(assetsRoot, assetsRoot);
  }

  function walk(dir, assetsRoot) {
    fs.readdirSync(dir).forEach(name => {
      const fullPath = path.join(dir, name);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath, assetsRoot);
      } else {
        const rel = path.relative(assetsRoot, fullPath).split(path.sep).join('/');
        const key = `_assets/${rel}`;
        const uri = toDataUri(fullPath, { displayName: key, size: stat.size, logging, maxBase64AssetBytes });
        map[key] = uri;
        map[`/${key}`] = uri;
        map[key.replace(/^_/, '')] = uri;
      }
    });
  }

  addDirectory(staticBuildPath('_assets'));
  addDirectory(offlineAssetsDirectory);

  return map;
}

function toDataUri(filePath, {
  mime = mimeTypeForPath(filePath),
  displayName = filePath,
  size = fs.statSync(filePath).size,
  logging = false,
  maxBase64AssetBytes = MAX_BASE64_ASSET_BYTES
} = {}) {
  if (size > maxBase64AssetBytes) {
    if (logging) {
      console.warn(chalk.yellow(
        `Could not inline asset for single-file build because it is too large (${formatFileSize(size)}): ${displayName}`
      ));
    }
    return offlineAssetPlaceholderDataUri(displayName);
  }

  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

function offlineAssetPlaceholderDataUri(displayName) {
  const assetName = abbreviatedAssetName(displayName);
  const escapedAssetName = escapeXml(assetName);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" role="img" aria-labelledby="title description">
  <title id="title">Asset unavailable offline</title>
  <desc id="description">${escapedAssetName} is too large to include in single-file offline mode.</desc>
  <rect width="800" height="450" fill="#f3f4f6"/>
  <rect x="310" y="92" width="180" height="128" rx="8" fill="none" stroke="#9ca3af" stroke-width="8"/>
  <path d="M326 202l48-48 35 35 24-24 41 41" fill="none" stroke="#9ca3af" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="455" cy="126" r="13" fill="#9ca3af"/>
  <path d="M304 226L496 86" stroke="#6b7280" stroke-width="10" stroke-linecap="round"/>
  <text x="400" y="282" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="600" fill="#374151">Asset unavailable offline</text>
  <text x="400" y="322" text-anchor="middle" font-family="system-ui, sans-serif" font-size="19" fill="#4b5563">${escapedAssetName}</text>
  <text x="400" y="357" text-anchor="middle" font-family="system-ui, sans-serif" font-size="17" fill="#6b7280">Too large to include in this single-file build.</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function abbreviatedAssetName(displayName) {
  const normalizedName = String(displayName).replace(/\\/g, '/');
  if (normalizedName.length <= 72) return normalizedName;
  return `…${normalizedName.slice(-71)}`;
}

function escapeXml(string) {
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatFileSize(bytes) {
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 || value >= 10 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

function inlineRemoteAssetsInString(string, remoteAssetCache, logging, maxBase64AssetBytes) {
  return string
    .replace(/(<img\s[^>]*?src=\\?["'])(https?:\/\/[^"']+?)(\\?["'])/g, (match, prefix, url, suffix) => {
      return `${prefix}${fetchRemoteAssetAsDataUri(url, remoteAssetCache, logging, maxBase64AssetBytes)}${suffix}`;
    })
    .replace(/("resourceUrl":\s*")((?:https?:\/\/)[^"]+?)(")/g, (match, prefix, url, suffix) => {
      return `${prefix}${fetchRemoteAssetAsDataUri(url, remoteAssetCache, logging, maxBase64AssetBytes)}${suffix}`;
    })
    .replace(/(url\((?:\\?["'])?)(https?:\/\/[^)"']+?)((?:\\?["'])?\))/g, (match, prefix, url, suffix) => {
      return `${prefix}${fetchRemoteAssetAsDataUri(url, remoteAssetCache, logging, maxBase64AssetBytes)}${suffix}`;
    });
}

function fetchRemoteAssetAsDataUri(url, remoteAssetCache, logging, maxBase64AssetBytes) {
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

      const size = fs.statSync(tempFilePath).size;
      const mime = contentType || mimeTypeForPath(new URL(candidateUrl).pathname);
      const dataUri = toDataUri(tempFilePath, { mime, displayName: url, size, logging, maxBase64AssetBytes });
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
module.exports._test = {
  MAX_BASE64_ASSET_BYTES,
  offlineAssetPlaceholderDataUri
};
