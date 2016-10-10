exports.register = (server, options, next) => {
  const getUser = (user) => server.app.users.filter((u) => u.user === user)[0];

  const correctPass = (user, pass) => getUser(user).pass === pass;

  server.route({
    method: 'post',
    path: '/login',
    handler: (request, reply) => {
      const user = request.payload.username;
      const pass = request.payload.password;

      if (!getUser(user)) {
        return reply({ message: 'User ' + user + ' not registered' }).code(400);
      }

      if (!correctPass(user, pass)) {
        return reply({ message: 'Incorrect password' });
      }

      reply({ message: 'Logging in' }).state('cookie', { user, pass });
    }
  });

  next();
}


exports.register.attributes = {
  pkg: {
    name: 'login'
  }
};

