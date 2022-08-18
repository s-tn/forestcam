var Nebula = require('./lib');
var static = require('node-static');
var http = require('http');
var file = new(static.Server)('public');
var app = http.createServer();

var nebula = new Nebula({
  path: './pages',
  mode: 'dev',
  server: app,
});

app.on('request', function (req, res) {
  file.serve(req, res);
});

app.listen(8080);