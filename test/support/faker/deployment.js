var Deployment = require('lib/models').Deployment;

exports.create = function create(identifier, options) {
  return new Deployment({
    name: identifier,
    title: identifier + ' fake democracy.',
    owner: options.owner._id,
    status: 'creating'
  });
}

exports.save = function save(instance, fn) {
  instance.save(fn);
}

exports.destroy = function destroy(instance, fn) {
  instance.remove(fn);
}