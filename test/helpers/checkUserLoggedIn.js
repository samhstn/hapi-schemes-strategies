module.exports = function (redisCli) {
  return function (user) {
    return new Promise((resolve, reject) => {
      redisCli.getAsync(user)
        .then((data) => {
          resolve(data !== null);
        })
        .catch(reject);
    });
  }
}

