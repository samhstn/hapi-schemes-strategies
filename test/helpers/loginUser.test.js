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
const loginUser = require('./loginUser.js')(redisCli);

tape('loginUser', (t) => {
  flushDb()
    .then(() => redisCli.keysAsync('*'))
    .then((data) => {
      t.equal(data.length, 0);
      return loginUser({ username: 'sam', password: 'pass' });
    })
    .then(() => redisCli.keysAsync('*'))
    .then((data) => {
      t.equal(data.length, 1);
      t.equal(data[0], 'sam');
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('loginUser with bad payload', (t) => {
  flushDb()
    .then(() => loginUser({ username: 'sam', key: 'key' }))
    .catch((err) => {
      t.equal(err, 'no password in loginUser payload');
      t.end();
    });
});

tape.onFinish(() => {
  flushDb()
    .then(() => {
      pool.end();
      redisCli.quit();
    });
});
