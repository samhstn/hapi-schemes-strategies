const crypto = require('crypto');

exports.register = (server, options, next) => {
  server.route({
    method: 'post',
    path: '/login',
    handler: (request, reply) => {
      const user = request.payload.username;
      const pass = request.payload.password;
      const pool = server.app.pool;
      const redisCli = server.app.redisCli;

      pool.connect(function (_, client, done) {
        client.query(
          'select username from user_table',
          function (_, usernameRes) {
            if (usernameRes.rows.map((row) => row && row.username).indexOf(user) === -1) {
              done();
              return reply({ message: 'User ' + user + ' not registered' }).code(401);
            }

            client.query(
              'select password from user_table where username=$1',
              [user],
              function (_, data) {
                done();
                if (data.rows[0].password !== pass) {
                  return reply({ message: 'Incorrect password' });
                }

                const key = crypto.randomBytes(256).toString('base64');

                redisCli.setAsync(user, key)
                  // 4 hours ttl
                  .then(() => redisCli.expireAsync(user, 4 * 60 * 60))
                  .then(() => {
                    reply({ message: 'Logging in' }).state('cookie', { user, key });
                  });
              }
            );
          }
        );
      });
    }
  });

  next();
}


exports.register.attributes = {
  pkg: {
    name: 'login'
  }
};

