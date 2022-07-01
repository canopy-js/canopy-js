let jsonForProjectDirectory = require('./components/json_for_project_directory');

function buildProject(projectDir, makeFolders) {
  jsonForProjectDirectory(
    projectDir + '/Topics',
    projectDir + '/build',
    makeFolders
  )
}

module.exports = buildProject;
