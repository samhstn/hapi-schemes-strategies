const qs = require('querystring');

module.exports = {
  method: 'get',
  path: '/login/{param?}',
  handler: (request, reply) => {
    if (request.headers.cookie) {
      return reply.redirect('/');
    }
    reply.view('login', qs.parse(request.params.param));
  }
}
