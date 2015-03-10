/**
 *  Module dependencies
 */

var mongoose = require('mongoose');
var config = require('lib/config')('db');

/**
 * Expose models linker helper
 *
 * @param {Express} app `Express` instance
 */

module.exports = function models() {

  /**
   *  Connect to mongo
   */

  mongoose.connect(config.connection, { db: { safe: true }});

  /**
   * Register Models
   */
  [
    'instance',
    'user'
  ].forEach(function(model){
    require('./'+model);
  });
}