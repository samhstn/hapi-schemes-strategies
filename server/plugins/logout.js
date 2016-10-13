const Joi = require('joi');

exports.register = function (server, options, next) {
  server.route({
    method: 'post',
    path: '/logout',
    config: {
      validate: {
        headers: Joi.object({
          'set-cookie': Joi.string().required()
        }).options({ allowUnknown: true })
      }
    },
    handler: (request, reply) => {
      const cookie = request.headers['set-cookie'].split('cookie=')[1];
      const userObj = JSON.parse((Buffer.from(cookie, 'base64')).toString())

      server.app.redisCli.delAsync(userObj.username)
        .then(() => {
          reply('hi')
            .unstate('cookie')
            .redirect('/login');
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
