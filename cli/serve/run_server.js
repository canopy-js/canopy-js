var express = require('express');
var app = express();
let chalk = require('chalk');

let buildPath =  process.cwd();
if (!process.cwd().match(/build\/?$/)){
  buildPath += '/build/';
}

let loggingFlag;

app.use(function(req, res, next) {
  res.on('finish', function() {
    if (loggingFlag) console.log(chalk.dim(`${req.url} - ${res.statusCode}`));
  });
  next();
});

// static file serve
app.use('*/_canopy.js', express.static(buildPath + '_canopy.js'));
app.use('*/_canopy.js.map', express.static(buildPath + '_canopy.js.map'));
app.use('*/_data', express.static(buildPath + '_data'));
app.use('*/_assets', express.static(buildPath + '_assets'));

// not found in static files, so default to index.html
app.use((req, res) => res.sendFile(buildPath + 'index.html'));

function runServer(port, logging) {
  loggingFlag = logging;
  const server = app.listen(port);

  const shutdown = () => {
    try {
      server.close(() => process.exit(0));
    } catch (_) {
      process.exit(0);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = runServer;
