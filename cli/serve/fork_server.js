const runServer = require('./run_server');
const open = require('open');
const chalk = require('chalk');

const port = Number(process.env.PORT || 4001);
const logging = process.env.LOGGING === '1';
const shouldOpen = process.env.OPEN === '1';

if (logging) console.log(chalk.gray(`Server forked (pid ${process.pid}) serving on port ${port}`));
runServer(port, logging);
if (shouldOpen) open(`http://localhost:${port}`);