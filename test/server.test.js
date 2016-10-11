const tape = require('tape');

const server = require('../server/server.js');
const flushDb = require('./helpers/flushDb.js')(server.app.pool);

['/login', '/register'].forEach((route) => {
  tape('GET :: ' + route, (t) => {
    const options = {
      method: 'get',
      url: route
    };
    server.inject(options, (res) => {
      t.equal(res.statusCode, 200);
      t.ok(res.payload.includes('<!DOCTYPE'));
      t.end();
    });
  });
});

tape('POST :: /register', (t) => {
  flushDb(() => {
    const options = {
      method: 'post',
      url: '/register',
      payload: {
        username: 'sam',
        password: 'pass'
      }
    };

    server.inject(options, (registerRes) => {
      t.equal(registerRes.statusCode, 200);
      t.ok(registerRes.payload.includes('Hello Register'));
      t.end();
    });
  });
});

tape('POST :: /login', (t) => {
  flushDb(() => {
    const registerOptions = {
      method: 'post',
      url: '/register',
      payload: {
        username: 'sam',
        password: 'pass'
      }
    };

    const loginOptions = {
      method: 'post',
      url: '/login',
      payload: {
        username: 'sam',
        password: 'pass'
      }
    };

    server.inject(registerOptions, (registerRes) => {
      t.equal(registerRes.statusCode, 200);
      t.ok(registerRes.payload.includes('Hello Register'));
      server.inject(loginOptions, (loginRes) => {
        t.equal(loginRes.statusCode, 302);
        t.equal(loginRes.headers.location, '/');
        t.equal(loginRes.headers['set-cookie'][0].indexOf('cookie'), 0);
        t.end();
      });
    });
  });
});

tape('GET :: / without a cookie', (t) => {
  const options = {
    method: 'get',
    url: '/'
  };

  server.inject(options, (res) => {
    t.equal(res.statusCode, 302);
    t.end();
  });
});

tape('GET :: / with incorrect cookie', (t) => {
  flushDb(() => {
    const registerOptions = {
      method: 'post',
      url: '/register',
      payload: {
        username: 'sam',
        password: 'pass'
      }
    };

    const loginOptions = {
      method: 'post',
      url: '/login',
      payload: {
        username: 'sam',
        password: 'pass'
      }
    };

    const homeOptions = {
      method: 'get',
      url: '/',
      headers: {}
    };

    server.inject(registerOptions, (registerRes) => {
      t.equal(registerRes.statusCode, 200);
      t.ok(registerRes.payload.includes('Hello Register'));

      server.inject(loginOptions, (loginRes) => {
        t.equal(loginRes.statusCode, 302);
        t.equal(loginRes.headers.location, '/');

        const creds = { user: 'sam', pass: 'notpass' };
        const wrongCookie = new Buffer(JSON.stringify(creds)).toString('base64');

        homeOptions.headers.cookie = 'cookie=' + wrongCookie;

        server.inject(homeOptions, (homeRes) => {
          t.equal(homeRes.statusCode, 401);
          t.equal(homeRes.payload, 'Incorrect password');
          t.end();
        });
      });
    });
  });
});

tape('GET :: / after setting cookie', (t) => {
  flushDb(() => {
    const registerOptions = {
      method: 'post',
      url: '/register',
      payload: {
        username: 'sam',
        password: 'pass'
      }
    };

    const loginOptions = {
      method: 'post',
      url: '/login',
      payload: {
        username: 'sam',
        password: 'pass'
      }
    };

    const homeOptions = {
      method: 'get',
      url: '/',
      headers: {}
    };

    server.inject(registerOptions, (registerRes) => {
      t.equal(registerRes.statusCode, 200);
      t.ok(registerRes.payload.includes('Hello Register'));
      server.inject(loginOptions, (loginRes) => {
        t.equal(loginRes.statusCode, 302);
        t.equal(loginRes.headers.location, '/');
        homeOptions.headers.cookie = loginRes.headers['set-cookie'][0].split(';')[0]
        server.inject(homeOptions, (homeRes) => {
          t.equal(homeRes.statusCode, 200);
          t.ok(homeRes.payload.includes('Hello Home'));
          t.end();
        });
      });
    });
  });
});

tape.onFinish(() => {
  server.app.redisCli.flushall(() => {
    flushDb(() => {
      server.app.redisCli.quit();
      server.app.pool.end();
    });
  });
});
