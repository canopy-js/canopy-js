let jsonForProjectDirectory = require('./components/json_for_project_directory');
let { updateFilesystem, getExplFileObjects } = require('./components/fs-helpers');
let path = require('path');

function buildProject(defaultTopicString, options) {
  let explFileObjects = getExplFileObjects(path.resolve('topics'), options);

  let {
    directoriesToEnsure,
    filesToWrite
  } = jsonForProjectDirectory(explFileObjects, defaultTopicString, options);

  updateFilesystem(directoriesToEnsure, filesToWrite, options);
}

module.exports = buildProject;
