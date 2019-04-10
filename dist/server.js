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
app.use('*/data', express.static(buildPath + 'data'));
app.use('*/assets', express.static(buildPath + 'assets'));

// not found in static files, so default to index.html
app.use((req, res) => res.sendFile(buildPath + 'index.html'));
app.listen(port);
