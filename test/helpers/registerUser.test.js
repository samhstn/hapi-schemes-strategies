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
const registerUser = require('./registerUser.js')(pool);

function rejectErr(err, reject) {
  if (err) {
    reject(err);
  }
}

function getUsers () {
  return new Promise((resolve, reject) => {
    pool.connect((connectionErr, client, done) => {
      rejectErr(connectionErr, reject);

      client.query(
        'select username from user_table',
        (selectErr, data) => {
          done();
          rejectErr(selectErr, reject);

          resolve(data);
        }
      );
    });
  });
}

tape('registerUser', (t) => {
  flushDb()
    .then(() => getUsers())
    .then((data) => {
      t.equal(data.rows.length, 0);
      return registerUser({ username: 'sam', password: 'pass' });
    })
    .then(() => getUsers())
    .then((data) => {
      t.equal(data.rows.length, 1);
      t.equal(data.rows.map((u) => u.username)[0], 'sam');
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
