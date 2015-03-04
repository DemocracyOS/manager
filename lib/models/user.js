/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define `User` Schema Read-Only
 */

var UserSchema = new Schema();

module.exports = mongoose.model('User', UserSchema);
