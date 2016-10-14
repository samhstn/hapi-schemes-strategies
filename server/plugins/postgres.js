const pg = require('pg');
const config = require('../../pgConfig.js');

exports.register = function (server, options, next) {
  server.app.pool = new pg.Pool(config);
  
  next();
}

exports.register.attributes = {
  pkg: {
    name: 'pg'
  }
};
