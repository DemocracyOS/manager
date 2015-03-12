/**
 * Module dependencies.
 */

var env = process.env;

/**
 * Expose env settings
 */

module.exports = {
  accessToken:   env.ACCESS_TOKEN,
  mongoUrl:      env.MONGO_URL,
  mongoUsersUrl: env.MONGO_USERS_URL,
  deis: {
    controller: env.DEIS_CONTROLLER,
    username:   env.DEIS_USER,
    password:   env.DEIS_PASSWORD,
  },
  'deployment image':             env.DEPLOYMENT_IMAGE,
  'deployment internal registry': env.DEPLOYMENT_INTERNAL_REGISTRY,
  'deployment db': {
    'connection':   env.DEPLOYMENT_DB_CONNECTION,
    'compose': {
      'token':      env.DEPLOYMENT_DB_COMPOSE_TOKEN,
      'account':    env.DEPLOYMENT_DB_COMPOSE_ACCOUNT,
      'deployment': env.DEPLOYMENT_DB_COMPOSE_DEPLOYMENT
    }
  },
  'deployment env': {
    BASIC_USERNAME:       env.DEPLOYMENT_ENV_BASIC_USERNAME,
    BASIC_PASSWORD:       env.DEPLOYMENT_ENV_BASIC_PASSWORD,
    CLIENT_CONF:          env.DEPLOYMENT_ENV_CLIENT_CONF,
    CLIENT_DEBUG:         env.DEPLOYMENT_ENV_CLIENT_DEBUG,
    COMMENTS_PER_PAGE:    env.DEPLOYMENT_ENV_COMMENTS_PER_PAGE,
    CORS_DOMAINS:         env.DEPLOYMENT_ENV_CORS_DOMAINS,
    DEBUG:                env.DEPLOYMENT_ENV_DEBUG,
    EXTERNAL_SIGNIN_URL:  env.DEPLOYMENT_ENV_EXTERNAL_SIGNIN_URL,
    EXTERNAL_SIGNUP_URL:  env.DEPLOYMENT_ENV_EXTERNAL_SIGNUP_URL,
    FAVICON:              env.DEPLOYMENT_ENV_FAVICON,
    FAQ:                  env.DEPLOYMENT_ENV_FAQ,
    GLOSSARY:             env.DEPLOYMENT_ENV_GLOSSARY,
    GOOGLE_ANALYTICS_TRACKING_ID: env.DEPLOYMENT_ENV_GOOGLE_ANALYTICS_TRACKING_ID,
    HOME_LINK:            env.DEPLOYMENT_ENV_HOME_LINK,
    HTTPS_PORT:           env.DEPLOYMENT_ENV_HTTPS_PORT,
    HTTPS_REDIRECT_MODE:  env.DEPLOYMENT_ENV_HTTPS_REDIRECT_MODE,
    JWT_SECRET:           env.DEPLOYMENT_ENV_JWT_SECRET,
    LEARN_MORE_URL:       env.DEPLOYMENT_ENV_LEARN_MORE_URL,
    LOCALE:               env.DEPLOYMENT_ENV_LOCALE,
    LOGO:                 env.DEPLOYMENT_ENV_LOGO,
    MONGO_USERS_URL:      env.DEPLOYMENT_ENV_MONGO_USERS_URL,
    NODE_ENV:             env.DEPLOYMENT_ENV_NODE_ENV,
    NODE_PATH:            env.DEPLOYMENT_ENV_NODE_PATH,
    NOTIFICATIONS_TOKEN:  env.DEPLOYMENT_ENV_NOTIFICATIONS_TOKEN,
    NOTIFICATIONS_URL:    env.DEPLOYMENT_ENV_NOTIFICATIONS_URL,
    PORT:                 env.DEPLOYMENT_ENV_PORT,
    PROTOCOL:             env.DEPLOYMENT_ENV_PROTOCOL,
    PUBLIC_PORT:          env.DEPLOYMENT_ENV_PUBLIC_PORT,
    PRIVACY_POLICY:       env.DEPLOYMENT_ENV_PRIVACY_POLICY,
    RSS_ENABLED:          env.DEPLOYMENT_ENV_RSS_ENABLED,
    SPAM_LIMIT:           env.DEPLOYMENT_ENV_SPAM_LIMIT,
    TERMS_OF_SERVICE:     env.DEPLOYMENT_ENV_TERMS_OF_SERVICE
  },
  'reserved names': env.RESERVED_NAMES ? env.RESERVED_NAMES.split(',') : [],
  locale :          env.LOCALE,
  port:             env.PORT,
  protocol:         env.PROTOCOL
};
