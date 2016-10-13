module.exports = {
  host: '127.0.0.1',
  port: 6379,
  db: process.env.NODE_ENV === 'test' ? 1 : 0
}

