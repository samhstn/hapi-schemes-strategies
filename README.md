# Hapi auth system

## How does it work?

We have three routes: `/`, `/register` and `/login`

(`/` is only available after logging in with a registered user)

#### Registration

When a user registeres, after checking if that username is available, their credentials are stored in postgres

#### Login

When a user logs in, the server creates a random string.

The string is stored as a cookie on the client and is cached in redis.

#### Home

On entering `/`, the client cookie is checked with the corresponding username key stored in redis

#### Logout

When logging out, the client cookie is removed and that cookie is also removed (uncached) from redis

The `/` route will now be restricted and the client will redirect to login with a message saying he has been logged out

## Quick start

Clone the repository:

```
$ git clone https://github.com/shouston3/hapi-schemes-strategies.git && cd hapi-schemes-strategies
```

Set up the databases:

In seperate terminal windows run:

```
$ redis-server
```

```
$ postgres -D /usr/local/var/postgres
```

Run the postgres schema:

In another seperate terminal window run the pg cli with `$ psql`

Then `\i schema.sql`

You can now quit the cli `\q`

Install the dependencies and start the server

```
npm install && npm start
```
