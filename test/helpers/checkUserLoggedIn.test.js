const tape = require('tape');
const pg = require('pg')
const assert = require('assert');
const bluebird = require('bluebird');
const redis = require('redis');

const pgConfig = require('../../pgConfig.js');
const pool = new pg.Pool(pgConfig);

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisConfig = require('../../redisConfig.js');
const redisCli = redis.createClient(redisConfig);

const flushDb = require('./flushDb.js')(pool, redisCli);
const checkUserLoggedIn = require('./checkUserLoggedIn.js')(redisCli);

tape('checkUserLoggedIn with no user logged in', (t) => {
  flushDb()
    .then(() => checkUserLoggedIn('sam'))
    .then((res) => {
      t.equal(res, false);
      t.end();
    })
    .catch((err) => {
      assert(!err, err);
    });
});

tape('checkUserLoggedIn with user logged in', (t) => {
  flushDb()
    .then(() => {
      return redisCli.setAsync('sam', 'pass');
    })
    .then(() => checkUserLoggedIn('sam'))
    .then((res) => {
      t.equal(res, true);
      t.end();
    })
    .catch((err) => {
      assert(!err, err);
    });
});

tape.onFinish(() => {
  flushDb()
    .then(() => {
      pool.end();
      redisCli.quit();
    });
});
