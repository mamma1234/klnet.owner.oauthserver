
/**
 * Module dependencies.
 */
// var database_url = 'postgresql://dev:dev@172.19.1.22:5432/dev';
// connectionString:  "postgresql://dev:dev@172.19.1.22:5432/dev"
// $ DATABASE_URL=postgres://postgres:1234@localhost/postgres node index.js
// var pg = require('pg-promise')(process.env.DATABASE_URL);
// var pg = require('pg-promise')(database_url);
// $ DATABASE_URL=postgres://dev:dev@172.19.1.22:5432/dev node server.js
/*
 * Get access token.
 */


// var pgp = require('pg-promise');
// var database_url = 'postgresql://dev:dev@172.19.1.22:5432/dev';
// var pg = pgp(database_url);

const { Pool } = require('pg');
const pg = new Pool({
  connectionString:  "postgresql://dev:dev@172.19.1.22:5432/dev",
  max: 30,
  min: 10
});

module.exports.getAccessToken = function(bearerToken) {
  return pg.query('SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE access_token = $1', [bearerToken])
    .then(function(result) {
      var token = result.rows[0];

      return {
        accessToken: token.access_token,
        client: {id: token.client_id},
        expires: token.expires,
        user: {id: token.userId}, // could be any object
      };
    });
};

/**
 * Get client.
 */

module.exports.getClient = function *(clientId, clientSecret) {
  return pg.query('SELECT client_id, client_secret, redirect_uri FROM oauth_clients WHERE client_id = $1 AND client_secret = $2', [clientId, clientSecret])
    .then(function(result) {
      var oAuthClient = result.rows[0];

      if (!oAuthClient) {
        return;
      }

      return {
        clientId: oAuthClient.client_id,
        clientSecret: oAuthClient.client_secret,
        grants: ['password'], // the list of OAuth2 grant types that should be allowed
      };
    });
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function *(bearerToken) {
  return pg.query('SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE refresh_token = $1', [bearerToken])
    .then(function(result) {
      return result.rowCount ? result.rows[0] : false;
    });
};

/*
 * Get user.
 */

module.exports.getUser = function *(username, password) {
  return pg.query('SELECT id FROM users WHERE username = $1 AND password = $2', [username, password])
    .then(function(result) {
      return result.rowCount ? result.rows[0] : false;
    });
};

/**
 * Save token.
 */

module.exports.saveAccessToken = function *(token, client, user) {
  return pg.query('INSERT INTO oauth_tokens(access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id) VALUES ($1, $2, $3, $4)', [
    token.accessToken,
    token.accessTokenExpiresOn,
    client.id,
    token.refreshToken,
    token.refreshTokenExpiresOn,
    user.id
  ]).then(function(result) {
    return result.rowCount ? result.rows[0] : false; // TODO return object with client: {id: clientId} and user: {id: userId} defined
  });
};
