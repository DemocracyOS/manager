var config = require('lib/config');
var log = require('lib/debug')('manager:deis-api');
var DeisAPI = require('deis-api');
var Batch = require('mjlescano-batch');

var deisConfig = {
  controller: config('deis').controller,
  username: config('deis').username,
  password: config('deis').password,
};

if (config('deis').secure) deisConfig.secure = true;

var deis = new DeisAPI(deisConfig);

exports.create = function (name, fn) {
  login(function(err){
    if (err) return fn(err);
    create(name, function(err, app){
      if (err) return fn(err);
      fn(null, app);
    });
  });
}

exports.deploy = function(name, envs, fn) {
  var batch = new Batch();

  batch.concurrency(1);

  batch.push(login);

  batch.push(function(done){ configurate(name, envs, done); });

  batch.push(function(done){ build(name, done); });

  batch.end(fn);
}

exports.destroy = function (name, fn) {
  var batch = new Batch();
  batch.concurrency(1);

  batch.push(login);
  batch.push(function(done){ destroy(name, done); });
  batch.end(fn);
}

function login(done){
  if (!deis.authenticated) {
    log('Logging in to Deis.');
    deis.login(function(err){
      if (!err || err.toString() === 'Error: Already logged in') {
        return done(null);
      }
      done(err.toString());
    });
    return;
  }

  done(null);
}

function create(name, done) {
  deis.apps.create(name, function(err, app) {
    if (err) {
      log('Error creating "%s".', name, err);
      destroyIfExists(name, function(_err){
        if (_err) log('Found error when tried to destroy "%s" erroed Deis instance: ', name, _err);
        done(err);
      });
      return;
    }

    log('Deis app created: ', app);

    done(null, app);
  });
}

function destroyIfExists(name, done) {
  deis.apps.info(name, function(err){
    if (err && err.toString() === 'Error: Not found') return done(null);
    if (err) return done(err);
    destroy(name, done);
  });
}

function destroy(name, done) {
  deis.apps.destroy(name, function(err) {
    if (err) {
      log('Couldn\'t destroy app with name %s: %s', name, err);
      return done(err);
    }

    log('Deis instance destroyed: %s.', name);

    done(null);
  });
}

function configurate(name, envs, done) {
  deis.config.set(name, envs, function(err) {
    if (err) {
      log('Error configurating "%s": %s', name, err);
      return done(err);
    }

    log('Deis app configured "%s".', name);

    done(null);
  });
}

function build(name, done) {
  var registry = config('deploymentInternalRegistry') || '';
  var image = config('deploymentImage');

  if (image && image[0] === '/') image.slice(0, 1);

  if (registry && registry[registry.length - 1] !== '/') registry += '/';

  var dock = registry + image;

  log('Building Deis app "%s" with docker image "%s".', name, dock);

  deis.builds.create(name, dock, function(err, app) {
    if (err) {
      log('Error building "%s" using image "%s".', name, dock, err);
      return done(err);
    }

    log('Deis app "%s" built successfully.', name, app);

    done(null);
  });
}
