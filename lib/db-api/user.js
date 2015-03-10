/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.exists = function(id, fn){
  User.findOne({ _id : id }).exec(function(err, user) {
    if (err) return fn(err);
    if (!user) return fn(null, false);
    fn(null, true);
  });
}


