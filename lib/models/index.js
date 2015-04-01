/**
 *  Module dependencies
 */

var db = require('democracyos-db');
var config = require('lib/config');

/**
 *  Connect to mongo
 */

var dataDb = db.getDefaultConnection();

// Register user separately since we need to expose it
exports.Deployment = require('./deployment')(dataDb);
exports.Feed = require('./feed')(dataDb);
exports.User = require('./user')(dataDb);

// Perform primary connection
db.connect(config('mongoUrl'));