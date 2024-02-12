let jsonForProjectDirectory = require('./components/json_for_project_directory');
let { updateFilesystem, getExplFileData } = require('./components/fs-helpers');
let path = require('path');

function buildProject(defaultTopicString, options) {
  let [explFileData, newStatusData] = getExplFileData(path.resolve('topics'), options);

  let {
    directoriesToEnsure,
    filesToWrite
  } = jsonForProjectDirectory(explFileData, newStatusData, defaultTopicString, options);

  updateFilesystem(directoriesToEnsure, filesToWrite, options);
}

module.exports = buildProject;
