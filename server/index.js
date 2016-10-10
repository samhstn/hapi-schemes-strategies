const server = require('./server.js');

server.start(() => {
  console.log('Server running on ' + server.info.uri);
});
