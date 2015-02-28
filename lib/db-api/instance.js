/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Instance = mongoose.model('Instance');
var pick = require('mout/object/pick');
var log = require('lib/debug')('manager:db-api:instance');

exports.all = function all(fn) {
  log('Looking for all instances');

  Instance
  .find({ deletedAt: null })
  .select('name title url summary imageUrl')
  .exec(function(err, instances) {
    if (err) {
      log('Found error: %s', err);
      return fn(err);
    }

    log('Delivering instances %j', instances);

    fn(null, { instances: instances });
  });

  return this;
};

exports.create = function create(data, fn) {
  log('Creating new instance');

  data = pick(data, [
    'name',
    'title',
    'summary',
    'imageUrl',
  ])

  var instance = new Instance(data);
  instance.save(onsave);

  function onsave(err) {
    if (err) return log('Found error: %s', err), fn(err);
    log('Saved instance with id %s', instance.id);
    fn(null, instance);
  }
};

exports.remove = function remove(instance, fn) {
  debugger
  instance.remove(function(err) {
    if (err) return log('Found error %s', err), fn(err);
    log('Instance %s removed', instance.id);
    fn(null);
  });
};

exports.count = function find(query, fn) {
  Instance.count(query).exec(fn);
};