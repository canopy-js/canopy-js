let jsonForProjectDirectory = require('./components/json_for_project_directory');
let { updateFileSystem, getExplFileObjects } = require('./components/fs-helpers');
let path = require('path');

function buildProject(defaultTopicString, options) {
  let explFileObjectsByPath = getExplFileObjects(path.resolve('topics'), options);

  let {
    directoriesToEnsure,
    filesToWrite
  } = jsonForProjectDirectory(explFileObjectsByPath, defaultTopicString, options);

  updateFileSystem(directoriesToEnsure, filesToWrite, options);
}

module.exports = buildProject;
