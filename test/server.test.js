const tape = require('tape');

const server = require('../server/server.js');

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
    t.equal(JSON.parse(registerRes.payload).message, 'User sam registered');
    t.end();
  });
});

tape('POST :: /login', (t) => {
  server.app.users = [];

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
    t.equal(JSON.parse(registerRes.payload).message, 'User sam registered');
    server.inject(loginOptions, (loginRes) => {
      t.equal(loginRes.statusCode, 200);
      t.equal(JSON.parse(loginRes.payload).message, 'Logging in');
      t.equal(loginRes.headers['set-cookie'][0].indexOf('cookie'), 0);
      t.end();
    });
  });
});

tape('GET :: / wihtout a cookie', (t) => {
  const options = {
    method: 'get',
    url: '/'
  };

  server.inject(options, (res) => {
    t.equal(res.statusCode, 401);
    t.ok(res.payload, 'No cookie set');
    t.end();
  });
});

tape('GET :: / with incorrect cookie', (t) => {
  server.app.users = [];

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
    t.equal(JSON.parse(registerRes.payload).message, 'User sam registered');

    server.inject(loginOptions, (loginRes) => {
      t.equal(loginRes.statusCode, 200);
      t.equal(JSON.parse(loginRes.payload).message, 'Logging in');

      const wrongCookie = new Buffer(JSON.stringify({ user: 'sam', pass: 'notpass' })).toString('base64');

      homeOptions.headers.cookie = 'cookie=' + wrongCookie;

      server.inject(homeOptions, (homeRes) => {
        t.equal(homeRes.statusCode, 401);
        t.equal(homeRes.payload, 'Incorrect username or password');
        t.end();
      });
    });
  });
});

tape('GET :: / after setting cookie', (t) => {
  server.app.users = [];

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
    t.equal(JSON.parse(registerRes.payload).message, 'User sam registered');
    server.inject(loginOptions, (loginRes) => {
      t.equal(loginRes.statusCode, 200);
      t.equal(JSON.parse(loginRes.payload).message, 'Logging in');
      homeOptions.headers.cookie = loginRes.headers['set-cookie'][0].split(';')[0]
      server.inject(homeOptions, (homeRes) => {
        t.equal(homeRes.statusCode, 200);
        t.ok(homeRes.payload.includes('Hello Home'));
        t.end();
      });
    });
  });
});

tape.onFinish(() => {
  server.app.redisCli.flushall(() => {
    server.app.redisCli.quit();
  });
});
