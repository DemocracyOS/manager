var User = require('lib/models').User;
var crypto = require('crypto');

exports.create = function create(identifier) {
  return new User({
    email: identifier + '@faker-domain.dev'
  });
}

exports.save = function save(instance, fn) {
  instance.save(fn);
}

exports.destroy = function destroy(instance, fn) {
  instance.remove(fn);
}