/**
 *  Module dependencies
 */

var db = require('democracyos-db');
var config = require('lib/config');

/**
 * Expose models linker helper
 *
 * @param {Express} app `Express` instance
 */

module.exports = function models() {

  /**
   *  Connect to mongo
   */

  var dataDb = db.getDefaultConnection();

  /**
   * Register Models
   */
  [
    'instance'
  ].forEach(function(model){
    require('./'+model)(dataDb);
  });

  // Treat User model as per configuration
  var usersDb = dataDb;

  // If a separate database is configured, create a dedicated connection
  var usingSeparateUsersDb = !!(config('mongoUsersUrl') && (config('mongoUsersUrl') != config('mongoUrl')));
  if (usingSeparateUsersDb) {
    usersDb = db.createConnection(config('mongoUsersUrl'));
  }

  exports.User = require('./user')(usersDb);

  // Perform primary connection
  db.connect(config('mongoUrl'));
}