/**
 * Module dependencies.
 */

var env = process.env;

/**
 * Expose env settings
 */

module.exports = {
  accessToken:   env.ACCESS_TOKEN, // 'access_token' param needed on any call to Manager.
  mongoUrl:      env.MONGO_URL, // DB connection string for Manager

  // Deis API auth. Deis server where the Deployments will be instantiated.
  deis: {
    controller:  env.DEIS_CONTROLLER,
    username:    env.DEIS_USER,
    password:    env.DEIS_PASSWORD,
  },

  // The docker image of DemocracyOS/app that will be used for creating Deployments.
  'deployment image':             env.DEPLOYMENT_IMAGE,

  // (optional) Provide an internal registry if the 'deployment image' is not hosted ong Docker's Hub.
  'deployment internal registry': env.DEPLOYMENT_INTERNAL_REGISTRY,

  /**
   * MongoDB connection string for cluster where deployment DBs will be created.
   * Must provide a user with 'root' role. Accepts single server or replicaSet string.
   */
  deploymentMongoUrl: env.DEPLOYMENT_MONGO_URL,

  // ENV vars that will be setted by default on new Deployments.
  'deployment env': {
    BASIC_USERNAME:               env.DEPLOYMENT_ENV_BASIC_USERNAME,
    BASIC_PASSWORD:               env.DEPLOYMENT_ENV_BASIC_PASSWORD,
    CLIENT_CONF:                  env.DEPLOYMENT_ENV_CLIENT_CONF,
    CLIENT_DEBUG:                 env.DEPLOYMENT_ENV_CLIENT_DEBUG,
    COMMENTS_PER_PAGE:            env.DEPLOYMENT_ENV_COMMENTS_PER_PAGE,
    CORS_DOMAINS:                 env.DEPLOYMENT_ENV_CORS_DOMAINS,
    DEBUG:                        env.DEPLOYMENT_ENV_DEBUG,
    EXTERNAL_SIGNIN_URL:          env.DEPLOYMENT_ENV_EXTERNAL_SIGNIN_URL,
    EXTERNAL_SIGNUP_URL:          env.DEPLOYMENT_ENV_EXTERNAL_SIGNUP_URL,
    FAVICON:                      env.DEPLOYMENT_ENV_FAVICON,
    FAQ:                          env.DEPLOYMENT_ENV_FAQ,
    GLOSSARY:                     env.DEPLOYMENT_ENV_GLOSSARY,
    GOOGLE_ANALYTICS_TRACKING_ID: env.DEPLOYMENT_ENV_GOOGLE_ANALYTICS_TRACKING_ID,
    HOME_LINK:                    env.DEPLOYMENT_ENV_HOME_LINK,
    HTTPS_PORT:                   env.DEPLOYMENT_ENV_HTTPS_PORT,
    HTTPS_REDIRECT_MODE:          env.DEPLOYMENT_ENV_HTTPS_REDIRECT_MODE,
    JWT_SECRET:                   env.DEPLOYMENT_ENV_JWT_SECRET,
    LEARN_MORE_URL:               env.DEPLOYMENT_ENV_LEARN_MORE_URL,
    LOCALE:                       env.DEPLOYMENT_ENV_LOCALE,
    LOGO:                         env.DEPLOYMENT_ENV_LOGO,
    LOGO_MOBILE:                  env.DEPLOYMENT_ENV_LOGO_MOBILE,
    MONGO_USERS_URL:              env.DEPLOYMENT_ENV_MONGO_USERS_URL,
    NODE_ENV:                     env.DEPLOYMENT_ENV_NODE_ENV,
    NODE_PATH:                    env.DEPLOYMENT_ENV_NODE_PATH,
    NOTIFICATIONS_TOKEN:          env.DEPLOYMENT_ENV_NOTIFICATIONS_TOKEN,
    NOTIFICATIONS_URL:            env.DEPLOYMENT_ENV_NOTIFICATIONS_URL,
    PORT:                         env.DEPLOYMENT_ENV_PORT,
    PROTOCOL:                     env.DEPLOYMENT_ENV_PROTOCOL,
    PUBLIC_PORT:                  env.DEPLOYMENT_ENV_PUBLIC_PORT,
    PRIVACY_POLICY:               env.DEPLOYMENT_ENV_PRIVACY_POLICY,
    RSS_ENABLED:                  env.DEPLOYMENT_ENV_RSS_ENABLED,
    SPAM_LIMIT:                   env.DEPLOYMENT_ENV_SPAM_LIMIT,
    TERMS_OF_SERVICE:             env.DEPLOYMENT_ENV_TERMS_OF_SERVICE
  },

  // Reserved names that can't be used on Deployments
  'reserved names': env.RESERVED_NAMES ? env.RESERVED_NAMES.split(',') : [],
  locale :          env.LOCALE,
  port:             env.PORT
};
