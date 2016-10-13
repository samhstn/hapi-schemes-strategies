const fs = require('fs');
const path = require('path');
const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');

function rejectErr (err, reject) {
  if (err) {
    reject(err); 
  }
}

module.exports = function (pool, redisCli) {
  return function () {
    return new Promise((resolve, reject) => {
      pool.connect((connectErr, client, done) => {
        rejectErr(connectErr)
        
        fs.readFile(schemaPath, 'utf8', (readfileErr, schema) => {
          rejectErr(readfileErr);
          client.query(schema, () => {
            done();
            redisCli.flushall(() => {
              resolve();
            });
          });
        });
      });
    });
  }
}
