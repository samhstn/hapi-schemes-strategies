module.exports = {
  method: 'get',
  path: '/login',
  handler: (request, reply) => {
    reply.file('./public/login.html'); 
  }
}
