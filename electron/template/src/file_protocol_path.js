const path = require('path');

const APP_RESOURCE_DIRECTORIES = new Set(['_assets', '_data']);

function appResourcePathForFileUrl(requestUrl, appRoot) {
  let pathname;
  try {
    const url = new URL(requestUrl);
    if (url.protocol !== 'file:') return;
    pathname = url.pathname;
  } catch (_) {
    return;
  }

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map(segment => decodeURIComponent(segment));
  const resourceDirectoryIndex = segments.findIndex(segment =>
    APP_RESOURCE_DIRECTORIES.has(segment)
  );

  if (resourceDirectoryIndex === -1) return;
  return path.join(appRoot, ...segments.slice(resourceDirectoryIndex));
}

module.exports = appResourcePathForFileUrl;
