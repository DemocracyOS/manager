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
  deis: {
    controller: env.DEIS_CONTROLLER,
    username: env.DEIS_USER,
    password: env.DEIS_PASSWORD
  },
  'instance db': env.DEIS_INSTANCE_ENV ? JSON.parse(env.DEIS_INSTANCE_ENV) : undefined,
  'instance env': env.DEIS_INSTANCE_ENV ? JSON.parse(env.DEIS_INSTANCE_ENV) : undefined,
  locale : env.LOCALE,
  port: env.PORT,
  protocol: env.PROTOCOL
};
