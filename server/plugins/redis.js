const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

exports.register = function (server, options, next) {
  const opts = {
    host: '127.0.0.1',
    port: 6379,
    db: process.env.NODE_ENV === 'test' ? 1 : 0
  };

  server.app.redisCli = redis.createClient(opts);
  
  next();
}

exports.register.attributes = {
  pkg: {
    name: 'redis'
  }
};
