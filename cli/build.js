const fs = require('fs-extra');
const dedent = require('dedent-js');
const buildProject = require('./build/build_project');
let chalk = require('chalk');
let { DefaultTopic, canopyLocation, tryAndWriteHtmlError } = require('./shared/fs-helpers');
let Topic = require('./shared/topic');
let path = require('path');
let os = require('os');
let { execFileSync } = require('child_process');

const BUILD_LOCK_PATH = '.canopy-build.lock';

function build(options = {}) {
  const shouldLockBuild = !options.keepBuildDirectory;
  if (shouldLockBuild && !acquireBuildLock()) return;

  try {
    runBuild(options);
  } finally {
    if (shouldLockBuild) fs.rmSync(BUILD_LOCK_PATH, { force: true });
  }
}

function runBuild(options = {}) {
  let { symlinks, projectPathPrefix, hashUrls, keepBuildDirectory, manualHtml, logging } = options;
  const buildStart = Date.now();
  let defaultTopic = new DefaultTopic();
  if (!fs.existsSync('./topics')) throw new Error('There must be a topics directory present, try running "canopy init"');

  if (!keepBuildDirectory) {
    fs.rmSync('build', { recursive: true, force: true });
  }

  fs.ensureDirSync('build');

  const projectHasAssets = fs.existsSync('assets');
  const buildAssetsMissing = !fs.existsSync('build/_assets');
  const shouldCopyAssets = projectHasAssets && (!options.keepBuildDirectory || buildAssetsMissing);

  if (shouldCopyAssets) {
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
    if (options.cache && !options.deferFullBuild) {
      tryAndWriteHtmlError(() => buildProject(defaultTopic.name, { ...options, cache: false }), options);
    }

    if (options.logging) {
      const elapsedSeconds = ((Date.now() - buildStart) / 1000).toFixed(1);
      console.log(chalk.cyan(`Canopy build: build finished at ${'' + (new Date()).toLocaleTimeString()} (pid ${process.pid}) in ${elapsedSeconds}s`));
    }

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

function acquireBuildLock() {
  try {
    fs.writeFileSync(BUILD_LOCK_PATH, String(process.pid), { flag: 'wx' });
    return true;
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }

  let existingPid = null;

  try {
    existingPid = Number(fs.readFileSync(BUILD_LOCK_PATH, 'utf8').trim());
  } catch (_error) {
    fs.rmSync(BUILD_LOCK_PATH, { force: true });
    fs.writeFileSync(BUILD_LOCK_PATH, String(process.pid), { flag: 'wx' });
    return true;
  }

  if (pidIsRunning(existingPid)) return false;

  fs.rmSync(BUILD_LOCK_PATH, { force: true });
  fs.writeFileSync(BUILD_LOCK_PATH, String(process.pid), { flag: 'wx' });
  return true;
}

function pidIsRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

module.exports = build;
