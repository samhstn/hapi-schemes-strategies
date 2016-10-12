const redis = require('./redis.js');
const postgres = require('./postgres.js');
const scheme = require('./scheme.js');
const strategy = require('./strategy.js');
const register = require('./register.js');
const login = require('./login.js');
const clearCookies = require('./clearCookies.js');

module.exports = [
  redis,
  postgres,
  scheme,
  strategy,
  register,
  login,
  clearCookies
];
