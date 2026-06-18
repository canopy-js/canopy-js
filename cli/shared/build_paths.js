const path = require('path');

const buildRoot = 'build';
const staticBuildDirectory = path.join(buildRoot, 'static');
const singleFileBuildDirectory = path.join(buildRoot, 'file');

function staticBuildPath(...segments) {
  return path.join(staticBuildDirectory, ...segments);
}

function singleFileBuildPath(...segments) {
  return path.join(singleFileBuildDirectory, ...segments);
}

module.exports = {
  buildRoot,
  staticBuildDirectory,
  singleFileBuildDirectory,
  staticBuildPath,
  singleFileBuildPath
};
