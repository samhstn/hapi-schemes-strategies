module.exports = {
  method: 'get',
  path: '/register',
  handler: (request, reply) => {
    reply.file('./public/register.html'); 
  }
}
