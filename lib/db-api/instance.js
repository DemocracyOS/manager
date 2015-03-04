/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Instance = mongoose.model('Instance');
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

    fn(null, { instances: instances });
  });

  return this;
};

exports.get = function get(name, fn) {
  log('Looking for Instance %s', name);

  if (!Instance.nameIsValid(name)) {
    return fn('Invalid instance name.');
  }

  Instance
  .findOne({name: name})
  .exec(function (err, instance) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }
    fn(null, instance);
  });

  return this;
};

exports.create = function create(data, fn) {
  log('Creating new instance.');

  var instance = new Instance(data);
  instance.save(onsave);

  function onsave(err) {
    if (err) return log('Found error: %s', err), fn(err);
    log('Saved instance with id %s', instance.id);
    fn(null, instance);
  }
};

exports.remove = function remove(instance, fn) {
  instance.remove(fn);
};

exports.count = function find(query, fn) {
  Instance.count(query).exec(fn);
};