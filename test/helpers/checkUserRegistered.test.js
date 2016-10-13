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
const setupPool = require('./setupPool.js')(pool);
const checkUserRegistered = require('./checkUserRegistered.js')(pool);

function rejectErr (err, reject) {
  if (err) {
    reject(err);
  }
}

tape('checkUserRegistered with no user registered', (t) => {
  flushDb()
    .then(() => checkUserRegistered('sam'))
    .then((res) => {
      t.equal(res, false);
      t.end();
    })
    .catch((err) => {
      assert(!err, err);
    });
});

tape('checkUserRegistered with user registered', (t) => {
  flushDb()
    .then(setupPool)
    .then((_) => {
      return new Promise((resolve, reject) => {
        _.client.query(
          'insert into user_table (username, password) values ($1,$2)',
          ['sam', 'pass'],
          (err) => {
            _.done();
            rejectErr(err, reject);
            resolve('sam');
          }
        );
      });
    })
    .then(checkUserRegistered)
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
