const assert = require('assert');
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

internals.validate = (server, options) => {
  const scheme = {
    authenticate: (request, reply) => {
      if (!options) {
        return reply('Server error: No server options specified').code(500);
      }
      
      if (!request.headers['set-cookie']) {
        return reply.redirect('/login/logged_out=true');
      }

      const cookie = request.headers['set-cookie'].split('cookie=')[1];

      if (!cookie) {
        return reply.redirect('/login/logged_out=true');
      }

      const buffer = Buffer.from(cookie, 'base64');

      if (!Buffer.isBuffer(buffer)) {
        console.log('Not a buffer');
        return reply.redirect('/login/logged_out=true');
      }

      try {
        const userObj = JSON.parse((Buffer.from(cookie, 'base64')).toString())

        const username = userObj.username;
        const key = userObj.key;

        options.validateFunc(request, username, key, (err, isValid, credentials) => {
          if (err) {
            return reply.redirect('/login/' + err).unstate('cookie');
          }

          if (!isValid) {
            return reply
              .redirect('/login/logged_out=true')
              .unstate('cookie');
          }

          reply.continue({ credentials });
        });
      } catch (_) {
        reply
          .redirect('/login/logged_out=true')
          .unstate('cookie');
      }
    }
  };

  return scheme;
};
