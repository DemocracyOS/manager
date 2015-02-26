/**
 *  Module dependencies
 */

var mongoose = require('mongoose');
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

  mongoose.connect(config('db').connection, { db: { safe: true }});

  /**
   * Register Models
   */
  [
    'instance'
  ].forEach(function(model){
    require('./'+model);
  });
}