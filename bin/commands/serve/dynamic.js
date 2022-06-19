var express = require('express');
var fs = require('fs');
var app = express();
let port = process.argv[2] || 3000;

let buildPath =  process.cwd();
if (!process.cwd().match(/build\/?$/)){
  buildPath += '/build/';
}

// static file serve
app.use('*/canopy.js', express.static(buildPath + 'canopy.js'));
app.use('*/canopy.js.map', express.static(buildPath + 'canopy.js.map'));
app.use('*/_data', express.static(buildPath + '_data'));
app.use('*/_assets', express.static(buildPath + '_assets'));

// not found in static files, so default to index.html
app.use((req, res) => res.sendFile(buildPath + 'index.html'));

function runDynamic(port) {
	app.listen(port);
}

module.exports = runDynamic;
