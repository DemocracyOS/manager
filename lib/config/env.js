/**
 * Module dependencies.
 */

var env = process.env;

/**
 * Expose env settings
 */

module.exports = {
  accessToken: env.ACCESS_TOKEN,
  mongoUrl: env.MONGO_URL,
  mongoUsersUrl: env.MONGO_USERS_URL,
  deis: {
    controller: env.DEIS_CONTROLLER,
    username: env.DEIS_USER,
    password: env.DEIS_PASSWORD,
    image: env.DEIS_IMAGE
  },
  'instance db': env.DEIS_INSTANCE_DB ? JSON.parse(env.DEIS_INSTANCE_DB) : undefined,
  'instance env': env.DEIS_INSTANCE_ENV ? JSON.parse(env.DEIS_INSTANCE_ENV) : undefined,
  'reserved names': env.RESERVED_NAMES ? JSON.parse(env.RESERVED_NAMES) : undefined,
  locale : env.LOCALE,
  port: env.PORT,
  protocol: env.PROTOCOL
};
