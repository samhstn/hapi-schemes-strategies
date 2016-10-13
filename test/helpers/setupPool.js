module.exports = function (pool) {
  return function () {
    return new Promise((resolve, reject) => {
      pool.connect((connectErr, client, done) => {
        if (connectErr) {
          reject(connectErr);
        }

        resolve({ client, done });
      });
    });
  };
}
