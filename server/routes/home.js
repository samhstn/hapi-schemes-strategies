module.exports = {
  method: 'get',
  path: '/',
  config: {
    auth: 'my-strategy'
  },
  handler: (request, reply) => {
    reply.view('home');
  }
}
