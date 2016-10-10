const internals = {};

exports.register = (server, options, next) => {
  server.auth.strategy('my-strategy', 'my-scheme', { validateFunc: internals.validate });
    
  next();
};

exports.register.attributes = {
  pkg: {
    name: 'my-strategy'
  }
};

internals.validate = function (request, username, password, cb) {
  if (!(username === 'sam' && password === 'pass')) {
    return cb('Incorrect username or password', false);
  }

  cb(null, true, { username, password });
}
