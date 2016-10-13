exports.register = (server, options, next) => {
  function validate (request, username, key, cb) {
    const redisCli = server.app.redisCli;

    redisCli.keysAsync('*')
      .then((keys) => {
        if (keys.indexOf(username) === -1) {
          return cb('logged_out=true');
        }

        redisCli.getAsync(username)
          .then((redisKey) => {
            if (redisKey !== key) {
              return cb('logged_out=true');
            }

            return cb(null, true, { username, key });
          });
      });
  }

  server.auth.strategy('my-strategy', 'my-scheme', { validateFunc: validate });

  next();
};

exports.register.attributes = {
  pkg: {
    name: 'my-strategy'
  }
};
