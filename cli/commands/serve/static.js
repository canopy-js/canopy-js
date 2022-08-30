const st = require('st');
const http = require('http');

function runStatic(port) {
  http.createServer(
    st(process.cwd())
  ).listen(port);
}

module.exports = runStatic;
