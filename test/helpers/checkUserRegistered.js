function rejectErr (err, reject) {
  if (err) {
    reject(err); 
  }
}

module.exports = function (pool) {
  return function (user) {
    return new Promise((resolve, reject) => {
      pool.connect((connectErr, client, done) => {
        rejectErr(connectErr, reject)
        
        client.query(
          'select username from user_table',
          (err, data) => {
            done();
            rejectErr(err, reject);

            resolve(data.rows.map((u) => u.username).indexOf(user) > -1);
          }
        );
      });
    });
  }
}
