const internals = {};

exports.register = (server, options, next) => {
  server.auth.scheme('my-scheme', internals.validate);
    
  next();
};

exports.register.attributes = {
  pkg: {
    name: 'my-scheme'
  }
};

const extractJson = (cookie, str) => JSON.parse((new Buffer(cookie.split('cookie=')[1], 'base64')).toString())[str];

internals.validate = (server, options) => {
  const scheme = {
    authenticate: (request, reply) => {
      if (!options) {
        return reply('No options specified').code(500);
      }
      
      if (!request.headers.cookie) {
        return reply('No cookie set').code(401);
      }

      const username = extractJson(request.headers.cookie, 'user');
      const key = extractJson(request.headers.cookie, 'key');

      options.validateFunc(request, username, key, (err, isValid, credentials) => {
        if (!isValid) {
          return reply(err).code(401);
        }

        return reply.continue({ credentials });
      });
    }
  };

  return scheme;
};
