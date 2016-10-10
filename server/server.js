const Hapi = require('hapi');
const Inert = require('inert');

const routes = require('./routes/index.js');
const plugins = require('./plugins/index.js');

const port = process.env.PORT || 4000;

const server = new Hapi.Server();

server.connection({ port });

server.state('login', {
  ttl: null,
  isSecure: true,
  isHttpOnly: true,
  encoding: 'base64json'
});

server.register([ Inert ].concat(plugins), (err) => {
  if (err) {
    throw new Error(err); 
  }

  server.route(routes);
});

module.exports = server;
