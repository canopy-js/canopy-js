var express = require('express');
var app = express();

// static file serve
app.use(express.static(process.cwd()));
app.use('/data', express.static(process.cwd() + '/data'));

// not found in static files, so default to index.html
app.use((req, res) => res.sendFile(process.cwd() + "/index.html"));
app.listen(3000);
