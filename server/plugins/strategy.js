exports.register = (server, options, next) => {
  function validate (request, username, key, cb) {
    const redisCli = server.app.redisCli;

    redisCli.keysAsync('*')
      .then((keys) => {
        if (keys.indexOf(username) === -1) {
          return cb('Incorrect username', false);
        }

        redisCli.getAsync(username)
          .then((redisKey) => {
            if (redisKey !== key) {
              return cb('Incorrect password', false);
            }

            return cb(null, true, { username, key });
          });
      });
  }

  server.auth.strategy('my-strategy', 'my-scheme', { validateFunc: validate });

  server.state('cookie', {
    ttl: null,
    isHttpOnly: true,
    encoding: 'base64'
  });

  server.ext('onRequest', (request, reply) => {
    if (!(process.env.NODE_ENV === 'test')) {
      console.log(Object.keys(request), request.auth);
    }

    reply.continue()
  });

  next();
};

exports.register.attributes = {
  pkg: {
    name: 'my-strategy'
  }
};
