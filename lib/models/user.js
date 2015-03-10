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


module.exports = mongoose.model('User', UserSchema);
