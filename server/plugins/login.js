exports.register = (server, options, next) => {
  server.route({
    method: 'post',
    path: '/login',
    handler: (request, reply) => {
      const user = request.payload.username;
      const pass = request.payload.password;
      const pool = server.app.pool;

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

                reply({ message: 'Logging in' }).state('cookie', { user, pass });;
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

