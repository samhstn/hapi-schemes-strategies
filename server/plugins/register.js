exports.register = (server, options, next) => {

  server.app.users = server.app.users || [];

  server.route({
    method: 'POST',
    path: '/register',
    handler: (request, reply) => {
      const user = request.payload.username;
      const pass = request.payload.password;

      if (server.app.users.filter((u) => u === user)[0]) {
        return reply({ message: 'Username ' + user + ' not available'});
      }

      server.app.users.push({ user, pass });

      reply({ message: 'User ' + user + ' registered'});
    }
  });

  next();
}


exports.register.attributes = {
  pkg: {
    name: 'register'
  }
};

