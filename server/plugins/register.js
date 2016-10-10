const bcrypt = require('bcrypt');

exports.register = (server, options, next) => {
  server.route({
    method: 'POST',
    path: '/register',
    handler: (request, reply) => {
      const user = request.payload.username;
      const pass = request.payload.password;
      const pool = server.app.pool;

      function _available (users, username) {
        return users.rows.map((row) => row && row.username)
          .indexOf(username) > -1;
      }

      pool.connect((_, client, done) => {
        client.query('select username from user_table', (_, res) => {
          if (_available(res, user)) {
            done();
            return reply({ message: 'Username ' + user + ' not available' });
          }

          bcrypt.hash(pass, 3, function (_, hash) {
            client.query(
              'insert into user_table (username, password) values ($1, $2)',
              [user, hash],
              function () {
                done();
                reply({ message: 'User ' + user + ' registered' });
              }
            );
          });
        });
      });
    }
  });

  next();
}


exports.register.attributes = {
  pkg: {
    name: 'register'
  }
};

