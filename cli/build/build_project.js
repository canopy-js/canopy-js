let jsonForProjectDirectory = require('./components/json_for_project_directory');
let { updateFilesystem, getExplFileData } = require('./components/fs-helpers');
let path = require('path');

function buildProject(defaultTopicString, options) {
  let explFileData = getExplFileData(path.resolve('topics'));

  let {
    directoriesToEnsure,
    filesToWrite
  } = jsonForProjectDirectory(explFileData, defaultTopicString, options);

  updateFilesystem(directoriesToEnsure, filesToWrite, options);
}

module.exports = buildProject;
