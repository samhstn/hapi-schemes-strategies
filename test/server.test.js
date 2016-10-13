const tape = require('tape');
const assert = require('assert');

const server = require('../server/server.js');
const pool = server.app.pool;
const redisCli = server.app.redisCli;
const checkUserRegistered = require('./helpers/checkUserRegistered.js')(pool);
const registerUser = require('./helpers/registerUser.js')(pool);
const checkUserLoggedIn = require('./helpers/checkUserLoggedIn.js')(redisCli);
const loginUser = require('./helpers/loginUser.js')(redisCli);
const flushDb = require('./helpers/flushDb.js')(pool, redisCli);

tape('/login :: GET', (t) => {
  server.inject({ method: 'get', url: '/login' })
    .then((res) => {
      t.equal(res.statusCode, 200);
      t.ok(res.payload.includes('Hello Login'));
      t.end();
    })
    .catch((err) => assert(!err, err));
});


tape('/register :: GET', (t) => {
  server.inject({ method: 'get', url: '/register' })
    .then((res) => {
      t.equal(res.statusCode, 200);
      t.ok(res.payload.includes('Hello Register'));
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/register :: POST with no payload or payload without user or pass', (t) => {
  const opts = { method: 'post', url: '/register' };

  flushDb()
    .then(() => {
      return server.inject(opts);
    })
    .then((res) => {
      t.equal(res.statusCode, 400, 'opts with no payload');
      const optsWoPass = Object.assign(opts, { payload: { username: 'sam' } });
      return server.inject(optsWoPass);
    })
    .then((res) => {
      t.equal(res.statusCode, 400, 'opts without a pass');
      const optsWoUser = Object.assign(opts, { payload: { password: 'pass' } });
      return server.inject(optsWoUser);
    })
    .then((res) => {
      t.equal(res.statusCode, 400, 'opts without a user');
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/register :: POST with an available username', (t) => {
  const opts = {
    method: 'post',
    url: '/register',
    payload: { username: 'sam', password: 'pass' }
  };

  flushDb()
    .then(() => server.inject(opts))
    .then((res) => {
      t.equal(res.statusCode, 200);
      t.ok(JSON.parse(res.payload).inserted);
      return checkUserRegistered('sam')
    })
    .then((res) => {
      t.ok(res);
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/register :: POST with an unavaliable username', (t) => {
  const opts = {
    method: 'post',
    url: '/register',
    payload: { username: 'sam', password: 'pass' }
  };

  flushDb()
    .then(() => registerUser({ username: 'sam', password: 'pass' }))
    .then(() => checkUserRegistered('sam'))
    .then((res) => {
      t.ok(res);
    })
    .then(() => server.inject(opts))
    .then((res) => {
      t.equal(res.statusCode, 200);
      t.notOk(JSON.parse(res.payload).inserted);
      t.end();
    })
});

tape('/login :: POST with no payload or payload without user or pass', (t) => {
  const opts = { method: 'post', url: '/login' };

  flushDb()
    .then(() => {
      return server.inject(opts);
    })
    .then((res) => {
      t.equal(res.statusCode, 400, 'opts with no payload');
      const optsWoPass = Object.assign(opts, { payload: { username: 'sam' } });
      return server.inject(optsWoPass);
    })
    .then((res) => {
      t.equal(res.statusCode, 400, 'opts without a pass');
      const optsWoUser = Object.assign(opts, { payload: { password: 'pass' } });
      return server.inject(optsWoUser);
    })
    .then((res) => {
      t.equal(res.statusCode, 400, 'opts without a user');
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/login :: POST with unregistered user', (t) => {
  const opts = {
    method: 'post',
    url: '/login',
    payload: { username: 'sam', password: 'pass' }
  };

  flushDb()
    .then(() => {
      return server.inject(opts);
    })
    .then((res) => {
       t.equal(res.statusCode, 401);
       t.notOk(JSON.parse(res.payload).login);
       t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/login :: POST with wrong password', (t) => {
  const opts = {
    method: 'post',
    url: '/login',
    payload: { username: 'sam', password: 'notpass' }
  };

  flushDb()
    .then(() => registerUser({ username: 'sam', password: 'pass' }))
    .then(() => server.inject(opts))
    .then((res) => {
      t.equal(res.statusCode, 401);
      t.notOk(JSON.parse(res.payload).login);
      t.end();
    })
    .catch((err) => assert(!err, err));
});

// perhaps change this to re-log them back in
tape('/login :: POST with already logged in user', (t) => {
  const opts = {
    method: 'post',
    url: '/login',
    payload: { username: 'sam', password: 'pass' }
  };

  flushDb()
    .then(() => registerUser({ username: 'sam', password: 'pass' }))
    .then(() => loginUser({ username: 'sam', password: 'pass' }))
    .then(() => server.inject(opts))
    .then((res) => {
      t.equal(res.statusCode, 200);
      t.ok(JSON.parse(res.payload).login);
      t.equal(JSON.parse(res.payload).message, 'already logged in');
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/login :: POST with correct creds not already logged in and a registered user', (t) => {
  const opts = {
    method: 'post',
    url: '/login',
    payload: { username: 'sam', password: 'pass' }
  };

  flushDb()
    .then(() => registerUser({ username: 'sam', password: 'pass' }))
    .then(() => server.inject(opts))
    .then((res) => {
      t.equal(res.statusCode, 200);
      t.ok(JSON.parse(res.payload).login);
      t.equal(JSON.parse(res.payload).message, 'logging in');
      t.equal(res.headers['set-cookie'][0].indexOf('cookie='), 0);
      redisCli.getAsync('sam')
        .then((key) => {
          const cookie = res.headers['set-cookie'][0].split('cookie=')[1];
          t.equal(JSON.parse((new Buffer(cookie, 'base64')).toString()).key, key);
          t.end();
        })
        .catch((error) => assert(!error, error));
    })
    .catch((err) => assert(!err, err));
});

tape('/logout :: POST with no cookies in the headers', (t) => {
  const opts = {
    method: 'post',
    url: '/logout'
  };

  flushDb()
    .then(() => server.inject(opts))
    .then((res) => {
      t.equal(res.statusCode, 400);
      return server.inject(Object.assign(opts, { headers: {} }));
    })
    .then((res) => {
      t.equal(res.statusCode, 400);
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/logout :: POST should read the cookie, unstate it and logout with redis', (t) => {
  const key = '267f666bf2496696fa299e20e6c3e6d84c4ac0fafdc1d389d585fc65c2606a7e';
  const userObj = { username: 'sam', key: key };
  const cookie = Buffer.from(JSON.stringify(userObj)).toString('base64')
  const opts = {
    method: 'post',
    url: '/logout',
    headers: {
      'set-cookie': 'cookie=' + cookie
    }
  };

  flushDb()
    .then(() => redisCli.set('sam', key))
    .then(() => checkUserLoggedIn('sam'))
    .then((res) => {
      t.ok(res);
      return server.inject(opts);
    })
    .then((res) => {
      t.equal(res.statusCode, 302);
      return checkUserLoggedIn('sam');
    })
    .then((res) => {
      t.notOk(res);
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/ :: GET should redirect to /login if no cookie is present', (t) => {
  const opts = {
    method: 'get',
    url: '/'
  };

  flushDb()
    .then(() => server.inject(opts))
    .then((res) => {
      t.equal(res.statusCode, 302);
      t.equal(res.headers.location, '/login/logged_out=true');
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/ :: GET should redirect to /login with invalid cookie', (t) => {
  const opts = {
    method: 'get',
    url: '/',
    headers: {
      'set-cookie': 'notacookie'
    }
  };

  flushDb()
    .then(() => server.inject(opts))
    .then((res) => {
      t.equal(res.statusCode, 302);
      t.equal(res.headers.location, '/login/logged_out=true');
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/ :: GET should redirect to /login with wrong cookie', (t) => {
  const opts = {
    method: 'get',
    url: '/',
    headers: {
      'set-cookie': 'cookie=wrongcookie'
    }
  };

  flushDb()
    .then(() => server.inject(opts))
    .then((res) => {
      t.equal(res.statusCode, 302);
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/ :: GET should redirect to /login for being stored in redis, but incorrect cookie key', (t) => {
  const opts = {
    method: 'get',
    url: '/',
    headers: {
      'set-cookie': 'cookie=eyJ1c2VybmFtZSI6InNhbSIsImtleSI6IkhNZUs5WE1sZW9DbTlhWmJrTWZSVEZsNThRVTNWbFhlYURlaktRVnN6UzJvWG45YVRVMlJ5VGVySHVqdVhRcHNqRzA5NjZXelRQT0hwVm95bTMyL05nY0toN085elhhV1VmZFlNV1NEUUNra1BMWHU0eUJGNWFLdFE3Umd4eTFNN0pXakE4a3d5a1F rNTFPdE8yRGVWMklFYnBrbDZPV00rSGRKUmFBNk1IYW1IU0srYVdUOHQ3SGM3QkJudXBIWFhqWkNFa3pDY290Tk5COUwzMjNsR3VMSktoL2VvTU1zL1IyZmtzaTJONm5sUk95SFNYWjVpNzhyN2ZvY2l1OHZKajQ4cnhBOG9UNFZ3OERnTVJoZERXczc0M1dhUHJJUWh3MU95WjBQQVBDTzNxZUpicW1XZzFZaFl KZmlQTzd1VW1mN2hlMmdlbWFIU09CVlkxWloxUT09In0=; HttpOnly; SameSite=Strict'
    }
  };

  const loginOpts = {
    method: 'post',
    url: '/login',
    payload: {
      username: 'sam',
      password: 'pass'
    }
  };

  flushDb()
    .then(() => registerUser({ username: 'sam', password: 'pass' }))
    .then(() => server.inject(loginOpts))
    .then((res) => {
      t.equal(res.statusCode, 200);
      return server.inject(opts);
    })
    .then((res) => {
      t.equal(res.statusCode, 302);
      t.equal(res.headers.location, '/login/logged_out=true');
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape('/ :: GET should reach / when logged in properly', (t) => {
  const loginOpts = {
    method: 'post',
    url: '/login',
    payload: {
      username: 'sam',
      password: 'pass'
    }
  };

  const opts = {
    method: 'get',
    url: '/'
  };

  let cookie;

  flushDb()
    .then(() => registerUser({ username: 'sam', password: 'pass' }))
    .then(() => server.inject(loginOpts))
    .then((res) => {
      t.equal(res.statusCode, 200);
      t.ok(res.headers['set-cookie'][0]);
      cookie = res.headers['set-cookie'][0];
      const optsWithCookie = Object.assign(opts, { headers: { 'set-cookie': cookie } });
      return server.inject(optsWithCookie);
    })
    .then((res) => {
      t.equal(res.statusCode, 200);
      t.ok(res.payload.includes('Hello Home'));
      t.end();
    })
    .catch((err) => assert(!err, err));
});

tape.onFinish(() => {
  flushDb()
    .then(() => {
      server.app.redisCli.quit();
      server.app.pool.end();
    });
});
