exports.register = function (server, options, next) {
  server.route({
    method: 'get',
    path: '/clearCookies',
    handler: (request, reply) => {
      reply('cookies cleared').unstate('cookie');
    }
  });
  
  next();
}

exports.register.attributes = {
  pkg: {
    name: 'clear cookies'
  }
};
