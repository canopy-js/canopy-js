var nodeStatic = require('node-static');

function runStatic(port) {
	var file = new nodeStatic.Server('./build');

	require('http').createServer(function (request, response) {
	    request.addListener('end', function () {
	        file.serve(request, response);
	    }).resume();
	}).listen(port);
}

module.exports = runStatic;
