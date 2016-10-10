# Hapi auth system

### How does it work?

We have three routes: '/', '/register' and '/login'

('/' is only available after logging in)

##### Registration

When a user registeres, after checking if that username is available, their credentials are stored in postgres

##### Login

When a user logs in, you create a random string and store it in redis along with the username for a configurable amount of time

The random string is stored as a cookie

##### Home

The cookie with redis will be checked on entering /

