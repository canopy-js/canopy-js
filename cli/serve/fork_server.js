const runServer = require('./run_server');
const open = require('open');

const port = Number(process.env.PORT || 4001);
const logging = process.env.LOGGING === '1';
const shouldOpen = process.env.OPEN === '1';

runServer(port, logging);
if (shouldOpen) open(`http://localhost:${port}`);
