const buildProject = require('./build_project');
let chalk = require('chalk');
let { DefaultTopic } = require('../shared/fs-helpers');

function run() {
  const rawOptions = process.argv[2];
  const options = rawOptions ? JSON.parse(rawOptions) : {};
  const defaultTopic = new DefaultTopic();

  if (options.logging) {
    console.log(chalk.magenta(`Canopy watch: background full build started at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
  }

  buildProject(defaultTopic.name, options);

  if (options.logging) {
    console.log(chalk.magenta(`Canopy watch: background full build finished at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
  }
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
