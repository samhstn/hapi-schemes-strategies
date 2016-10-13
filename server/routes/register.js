module.exports = {
  method: 'get',
  path: '/register',
  handler: (request, reply) => {
    reply.view('register');
  }
}
