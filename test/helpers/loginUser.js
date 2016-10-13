module.exports = (redisCli) => (userObj) => {
  userObjKeys = Object.keys(userObj);
  if (userObjKeys.length !== 2) {
    return Promise.reject('wrong number of keys in loginUser payload')
  }

  if (userObjKeys.indexOf('username') === -1) {
    return Promise.reject('no username in loginUser payload');
  }

  if (userObjKeys.indexOf('password') === -1) {
    return Promise.reject('no password in loginUser payload');
  }

  return redisCli.set(userObj.username, userObj.password);
}
