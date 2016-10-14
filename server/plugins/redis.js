const redis = require('redis');
const bluebird = require('bluebird');
const opts = require('../../redisConfig.js');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

exports.register = function (server, options, next) {
  server.app.redisCli = redis.createClient(opts);
  
  next();
}

exports.register.attributes = {
  pkg: {
    name: 'redis'
  }
};
