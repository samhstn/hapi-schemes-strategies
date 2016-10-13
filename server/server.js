require('env2')('./config.env');
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const Handlebars = require('handlebars');
const path = require('path');
const assert = require('assert');

const routes = require('./routes/index.js');
const plugins = require('./plugins/index.js');

const port = process.env.PORT || 4000;

const server = new Hapi.Server();

server.connection({ port: port });

server.register([ Inert, Vision ].concat(plugins), (err) => {
  assert(!err, err);

  server.state('cookie', {
    isSecure: false,
    isHttpOnly: true,
    encoding: 'base64json'
  });

  server.views({
    engines: { html: Handlebars },
    path: path.join(__dirname, 'views')
  });

  server.route(routes);
});

module.exports = server;
