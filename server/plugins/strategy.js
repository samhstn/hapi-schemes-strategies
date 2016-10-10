exports.register = (server, options, next) => {
  function validate (request, username, password, cb) {
    if (!(username === 'sam' && password === 'pass')) {
      return cb('Incorrect username or password', false);
    }

    cb(null, true, { username, password });
  }

  server.auth.strategy('my-strategy', 'my-scheme', { validateFunc: validate });
    
  next();
};

exports.register.attributes = {
  pkg: {
    name: 'my-strategy'
  }
};
