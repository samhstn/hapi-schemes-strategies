const crypto = require('crypto');
const bcrypt = require('bcrypt');

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
              return reply.view('login', {
                usernameMessage: 'User ' + user + ' not registered'
              }).code(401);
            }

            client.query(
              'select password from user_table where username=$1',
              [user],
              function (_, data) {
                done();

                bcrypt.compare(pass, data.rows[0].password, function (_, res) {
                  if (!res) {
                    return reply.view('login', {
                      passwordMessage: 'Incorrect password'
                    }).code(401);
                  }

                  const key = crypto.randomBytes(256).toString('base64');

                  redisCli.setAsync(user, key)
                    // 4 hours ttl
                    .then(() => redisCli.expireAsync(user, 4 * 60 * 60))
                    .then(() => {
                      reply.redirect('/index').state('cookie', { user, key });
                    });
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

