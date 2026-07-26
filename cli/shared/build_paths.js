const path = require('path');

const buildRoot = 'build';
const offlineAssetsDirectory = 'offline-assets';
const staticBuildDirectory = path.join(buildRoot, 'static');
const singleFileBuildDirectory = path.join(buildRoot, 'file');
const electronBuildDirectory = path.join(buildRoot, 'electron');
const electronAppDirectory = path.join(electronBuildDirectory, 'app');

function staticBuildPath(...segments) {
  return path.join(staticBuildDirectory, ...segments);
}

function singleFileBuildPath(...segments) {
  return path.join(singleFileBuildDirectory, ...segments);
}

function electronBuildPath(...segments) {
  return path.join(electronBuildDirectory, ...segments);
}

function electronAppPath(...segments) {
  return path.join(electronAppDirectory, ...segments);
}

module.exports = {
  buildRoot,
  offlineAssetsDirectory,
  staticBuildDirectory,
  singleFileBuildDirectory,
  electronBuildDirectory,
  electronAppDirectory,
  staticBuildPath,
  singleFileBuildPath,
  electronBuildPath,
  electronAppPath
};
