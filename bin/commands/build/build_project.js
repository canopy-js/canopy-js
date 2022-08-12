let jsonForProjectDirectory = require('./components/json_for_project_directory');
let { updateFilesystem, getExplFileData } = require('./components/helpers');

function buildProject(projectDir, makeFolders, logging) {
  let explFileData = getExplFileData(`${projectDir}/topics`);

  let {
    directoriesToEnsure,
    filesToWrite
  } = jsonForProjectDirectory(projectDir, explFileData, makeFolders, logging);

  updateFilesystem(directoriesToEnsure, filesToWrite, projectDir);
}

module.exports = buildProject;
