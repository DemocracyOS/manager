var config = require('lib/config');
var mongoose = require('mongoose');
var Instance = mongoose.model('Instance');
var log = require('lib/debug')('manager:deis-api');
var DeisAPI = require('deis-api');
var env = require('./env');
var crypto = require('crypto');

var deisConfig = config('deis');
var deis = new DeisAPI({
  controller: deisConfig.controller,
  username: deisConfig.username,
  password: deisConfig.password
});

exports.create = function create(instance, fn){
  // TODO: Refactor this methods with `batch` module.
  var err = null;

  if (!(instance instanceof Instance)) {
    err = '`instance` argument should be an `Instance` model instance.';
    return log('Found error: %s', err, instance.toJSON()), fn(err);
  }

  if (instance.isNew || instance.isModified()) {
    err = '`instance` should exists on the database and be valid.';
    return log('Found error: %s', err, instance.toJSON()), fn(err);
  }

  if (instance.hasDeisInstance()) {
    err = '`instance` model already has a Deis instance associated.';
    return log('Found error: %s', err, instance.toJSON()), fn(err);
  }

  if (!deis.authenticated) {
    deis.login(function(err){
      if (err) return fn(err);
      exports.create(instance, fn);
    });
    return;
  }

  deisAppsCreate(instance, fn);
}

function deisAppsCreate(instance, fn) {
  deis.apps.create(instance.name, function(err, app) {
    if (err) {
      log('Error creating `%s` app: %s', instance.name, err);
      fn(err);
      return;
    }

    log('Deis app created: %s', instance.name);

    function _fn(err) {
      if (err) {
        deis.apps.destroy(instance.name, function(err, app) {
          if (err) {
            return log('Couldn\'t destroy app with name %s on error: %s', app.id, err);
          }

          instance.unsetDeisInstance();

          log('App destroyed on error: %s', app.id);
        });

        return fn(err);
      }

      fn();
    }

    instance.setDeisInstance(app);

    deisConfigSet(instance, _fn);
  });
}

function deisConfigSet(instance, fn) {
  var config = env({
    ORGANIZATION_NAME: instance.title,
    HOST: instance.url,
    JWT_SECRET: crypto.randomBytes(20).toString('hex'),
    STAFF: []
  });

  deis.config.set(instance.name, config, function(err, values) {
    if (err) {
      log('Error configurating %s app: %s', instance.name, err);
      fn(err);
      return;
    }

    log('Deis app configured: %s', instance.name, values);

    deisBuildsCreate(instance, fn);
  });
}

function deisBuildsCreate(instance, fn){
  deis.builds.create(name, {
    image: deisConfig.image
  }, function(err, app) {
    if (err) {
      log('Error building `%s` app: %s', instance.name, err);
      fn(err);
      return;
    }

    log('Deis app builded: %s', instance.name, app);

    fn(null, instance);
  });
}
