/**
 * Module dependencies.
 */

var env = process.env;

/**
 * Expose env settings
 */

module.exports = {
  accestToken: env.ACCESS_TOKEN,
  db: {
    connection: env.MONGO_URL
  },
  locale : env.LOCALE,
  port: env.PORT,
  protocol: env.PROTOCOL
};