const buildProject = require('./build_project');
let chalk = require('chalk');
let { DefaultTopic } = require('../shared/fs-helpers');
let { registerFullBuildProcess } = require('../shared/full_build_processes');
let translateWatchErrorToBulk = require('../bulk/translate_watch_error_to_bulk');

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
  const rawOptions = process.argv[2];
  const options = rawOptions ? JSON.parse(rawOptions) : {};
  const translated = translateWatchErrorToBulk(error, options);
  console.error(chalk.red(translated.message || translated));
  process.exit(1);
}
