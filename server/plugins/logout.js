const Joi = require('joi');

exports.register = function (server, options, next) {
  server.route({
    method: 'post',
    path: '/logout',
    config: {
      validate: {
        headers: Joi.object({
          cookie: Joi.string().required()
        }).options({ allowUnknown: true })
      }
    },
    handler: (request, reply) => {
      const cookie = request.headers.cookie.split('cookie=')[1];
      const userObj = JSON.parse((Buffer.from(cookie, 'base64')).toString())

      server.app.redisCli.delAsync(userObj.username)
        .then(() => {
          // reply.redirect doesn't seem to work here
          // instead doing client side redirection
          reply({ redirect: true })
            .unstate('cookie');
        });
    }
  });

  next();
}

exports.register.attributes = {
  pkg: {
    name: 'logout'
  }
}
