/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Define `User` Schema Read-Only
 */

var UserSchema = new Schema({
  email: { type: String, lowercase: true, trim: true }
});

module.exports = function initialize(conn) {
  return conn.model('User', UserSchema);
}
