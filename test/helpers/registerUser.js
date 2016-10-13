function rejectErr (err, reject) {
  if (err) {
    reject(err);
  }
}

module.exports = function (pool) {
  return function (userObj) {
    return new Promise((resolve, reject) => {
      pool.connect((connectErr, client, done) => {
        rejectErr(connectErr, reject);

        client.query(
          'insert into user_table (username, password) values ($1,$2)',
          ['sam', 'pass'],
          (insertErr) => {
            done();
            rejectErr(insertErr, reject);
            resolve();
          }
        );
      });
    });
  }
}
