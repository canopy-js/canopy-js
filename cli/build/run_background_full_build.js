const buildProject = require('./build_project');
let chalk = require('chalk');
let { DefaultTopic } = require('../shared/fs-helpers');
let { registerFullBuildProcess } = require('../shared/full_build_processes');

function run() {
  const rawOptions = process.argv[2];
  const options = rawOptions ? JSON.parse(rawOptions) : {};
  const defaultTopic = new DefaultTopic();
  const releaseFullBuildProcess = registerFullBuildProcess();

  try {
    if (options.logging) {
      console.log(chalk.magenta(`Canopy full build: started at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
    }

    buildProject(defaultTopic.name, options);

    if (options.logging) {
      console.log(chalk.magenta(`Canopy full build: finished at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
    }
  } finally {
    releaseFullBuildProcess();
  }
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
