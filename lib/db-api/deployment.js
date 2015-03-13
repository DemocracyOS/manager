/**
 * Module dependencies.
 */

var Deployment = require('mongoose').model('Deployment');
var log = require('lib/debug')('manager:db-api:deployment');

exports.get = function get(name, fn) {
  log('Looking for deployment "%s"', name);

  if (!Deployment.nameIsValid(name)) {
    return fn('Invalid deployment name.');
  }

  Deployment
  .findOne({ name: name })
  .exec(function (err, deployment) {
    if (err) {
      log('Found error %o', err);
      return fn(err);
    }
    fn(null, deployment);
  });

  return this;
};

exports.create = function create(data, fn) {
  log('Creating new deployment.');

  var deployment = new Deployment(data);
  deployment.save(onsave);

  function onsave(err) {
    if (err) return log('Found error: %s', err), fn(err);
    log('Saved deployment with id %s', deployment.id);
    fn(null, deployment);
  }
};

exports.remove = function remove(deployment, fn) {
  deployment.remove(fn);
};

exports.exists = function exists(query, fn) {
  Deployment.find(query).limit(1).exec(function(err, deployments){
    if (err) return fn(err);
    fn(null, !!deployments.length);
  });
};
