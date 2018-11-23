var express = require('express');
var app = express();

// static file serve
app.use(express.static(process.cwd())); // canopy.js etc
app.use('/data', express.static(process.cwd() + '/data')); //json data files

// not found in static files, so default to index.html
app.use(/((?!\.json).)*$/, function serveIndex(req, res) { res.sendFile(process.cwd() + "/index.html")});
app.listen(3000);
