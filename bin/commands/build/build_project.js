let jsonForProjectDirectory = require('./components/json_for_project_directory');
let { updateFilesystem, getExplFileData } = require('./components/helpers');

function buildProject(projectDir, defaultTopicString, options) {
  let explFileData = getExplFileData(`${projectDir}/topics`);

  let {
    directoriesToEnsure,
    filesToWrite
  } = jsonForProjectDirectory(projectDir, explFileData, defaultTopicString, options);

  updateFilesystem(directoriesToEnsure, filesToWrite, projectDir);
}

module.exports = buildProject;
