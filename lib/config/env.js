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
    COMMENTS_PER_PAGE:    env.DEPLOYMENT_ENV_COMMENTS_PER_PAGE,
    LEARN_MORE_URL:       env.DEPLOYMENT_ENV_LEARN_MORE_URL,
    LOCALE:               env.DEPLOYMENT_ENV_LOCALE,
    LOGO:                 env.DEPLOYMENT_ENV_LOGO,
    FAVICON:              env.DEPLOYMENT_ENV_FAVICON,
    PORT:                 env.DEPLOYMENT_ENV_PORT,
    PUBLIC_PORT:          env.DEPLOYMENT_ENV_PUBLIC_PORT,
    NODE_ENV:             env.DEPLOYMENT_ENV_NODE_ENV,
    PROTOCOL:             env.DEPLOYMENT_ENV_PROTOCOL,
    SPAM_LIMIT:           env.DEPLOYMENT_ENV_SPAM_LIMIT,
    RSS_ENABLED:          env.DEPLOYMENT_ENV_RSS_ENABLED,
    NODE_PATH:            env.DEPLOYMENT_ENV_NODE_PATH,
    DEBUG:                env.DEPLOYMENT_ENV_DEBUG,
    NOTIFICATIONS_TOKEN:  env.DEPLOYMENT_ENV_NOTIFICATIONS_TOKEN,
    NOTIFICATIONS_URL:    env.DEPLOYMENT_ENV_NOTIFICATIONS_URL,
    CORS_DOMAINS:         env.DEPLOYMENT_ENV_CORS_DOMAINS,
    MONGO_USERS_URL:      env.DEPLOYMENT_ENV_MONGO_USERS_URL,
    EXTERNAL_SIGNIN_URL:  env.DEPLOYMENT_ENV_EXTERNAL_SIGNIN_URL,
    EXTERNAL_SIGNUP_URL:  env.DEPLOYMENT_ENV_EXTERNAL_SIGNUP_URL,
    JWT_SECRET:           env.DEPLOYMENT_ENV_JWT_SECRET,
    CLIENT_CONF:          env.DEPLOYMENT_ENV_CLIENT_CONF,
    BASIC_USERNAME:       env.DEPLOYMENT_ENV_BASIC_USERNAME,
    BASIC_PASSWORD:       env.DEPLOYMENT_ENV_BASIC_PASSWORD,
    FAQ:                  env.DEPLOYMENT_ENV_FAQ,
    TERMS_OF_SERVICE:     env.DEPLOYMENT_ENV_TERMS_OF_SERVICE,
    PRIVACY_POLICY:       env.DEPLOYMENT_ENV_PRIVACY_POLICY,
    GLOSSARY:             env.DEPLOYMENT_ENV_GLOSSARY,
    HTTPS_PORT:           env.DEPLOYMENT_ENV_HTTPS_PORT,
    HTTPS_REDIRECT_MODE:  env.DEPLOYMENT_ENV_HTTPS_REDIRECT_MODE,
    CLIENT_DEBUG:         env.DEPLOYMENT_ENV_CLIENT_DEBUG,
    GOOGLE_ANALYTICS_TRACKING_ID: env.DEPLOYMENT_ENV_GOOGLE_ANALYTICS_TRACKING_ID
  },
  'reserved names': env.RESERVED_NAMES,
  locale :          env.LOCALE,
  port:             env.PORT,
  protocol:         env.PROTOCOL
};
