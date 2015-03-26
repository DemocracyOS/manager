/**
 *  Module dependencies
 */

var mongoose = require('mongoose');
var db = require('democracyos-db')(mongoose);
var config = require('lib/config');

/**
 *  Connect to mongo
 */

var dataDb = db.getDefaultConnection();

/**
 * Register Models
 */

exports.Deployment = require('./deployment')(dataDb);
exports.Feed = require('./feed')(dataDb);
exports.User = require('./user')(dataDb);

// Perform primary connection
db.connect(config('mongoUrl'));