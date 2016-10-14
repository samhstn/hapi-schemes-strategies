const assert = require('assert');
const Joi = require('joi');

exports.register = function (server, options, next) {
  server.route({
    method: 'post',
    path: '/register',
    config: {
      validate: {
        payload: {
          username: Joi.string().required(),
          password: Joi.string().required()
        }
      }
    },
    handler: (request, reply) => {
      const username = request.payload.username;
      const password = request.payload.password;

      server.app.pool.connect((connectErr, client, done) => {
        assert(!connectErr, connectErr);

        client.query(
          'select username from user_table',
          (selectErr, data) => {
            assert(!selectErr, selectErr);

            if (data.rows.map((u) => u.username).indexOf(username) > -1) {
              done();
              return reply
                .redirect('/register/unavailable_user=true&user=' + username);
            }

            client.query(
              'insert into user_table (username, password) values ($1,$2)',
              [username, password],
              (insertErr) => {
                done();
                assert(!insertErr, insertErr);
                reply
                  .redirect('/register/registered=true');
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
    name: 'register'
  }
}
