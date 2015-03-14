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

var exports = module.exports = function models() {

  /**
   *  Connect to mongo
   */

  var dataDb = db.getDefaultConnection();

  /**
   * Register Models
   */
  [
    'deployment',
    'feed'
  ].forEach(function(model){
    require('./'+model)(dataDb);
  });

  // Register user separately since we need to expose it
  exports.User = require('./user')(dataDb);

  // Perform primary connection
  db.connect(config('mongoUrl'));
}