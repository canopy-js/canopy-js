let jsonForProjectDirectory = require('./components/json_for_project_directory');
let { updateFilesystem, getExplFileData } = require('./components/helpers');
let path = require('path');

function buildProject(projectDir, defaultTopicString, options) {
  let explFileData = getExplFileData(path.resolve(`${projectDir}/topics`));

  let {
    directoriesToEnsure,
    filesToWrite
  } = jsonForProjectDirectory(projectDir, explFileData, defaultTopicString, options);

  updateFilesystem(directoriesToEnsure, filesToWrite, projectDir, options);
}

module.exports = buildProject;
