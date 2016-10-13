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
