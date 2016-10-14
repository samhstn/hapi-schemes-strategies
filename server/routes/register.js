const qs = require('querystring');

module.exports = {
  method: 'get',
  path: '/register/{param?}',
  handler: (request, reply) => {
    reply.view('register', qs.parse(request.params.param));
  }
}
