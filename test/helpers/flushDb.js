const fs = require('fs');
const path = require('path');
const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');

module.exports = function (pool) {
  return function (cb) {
    pool.connect((_, client, done) => {
      fs.readFile(schemaPath, 'utf8', function (_, data) {
        client.query(data, function () {
          done();
          cb();
        });
      });
    });
  };
};
