var Deployment = require('lib/models').Deployment;

exports.create = function create(identifier, options) {
  return new Deployment({
    name: identifier,
    deisId: '123-123-123-123',
    url: 'identifier.democracyos.dev',
    title: identifier + ' fake democracy.',
    owner: options.owner._id,
    mongoUrl: 'mongodb://fakemongo:27017/fake-db',
    status: 'ready'
  });
}

exports.save = function save(instance, fn) {
  instance.save(fn);
}

exports.destroy = function destroy(instance, fn) {
  instance.remove(fn);
}