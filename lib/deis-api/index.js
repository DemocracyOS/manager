var config = require('lib/config');
var log = require('lib/debug')('manager:deis-api');
var DeisAPI = require('deis-api');
var crypto = require('crypto');
var Batch = require('mjlescano-batch');
var env = require('./env');
// var build = require('./build');

var deisConfig = config('deis');
var deis = new DeisAPI({
  controller: deisConfig.controller,
  username: deisConfig.username,
  password: deisConfig.password
});

exports.create = function (instance, fn) {
  var err = null;

  if (!instance.canAssignDeisInstance()) {
    err = { msg: '`instance` model can\'t be assigned with a deis instance: ' + instance.name };
    return fn(err);
  }

  var batch = new Batch();

  batch.concurrency(1);

  batch.push(login);

  batch.push(
    function(done){ create(done, instance); },
    function(done){ destroy(done, instance); }
  );

  batch.push(function(done){ configurate(done, instance); });

  batch.push(function(done){ deploy(done, instance); });

  batch.push(function(done){ save(done, instance); });

  batch.end(function(err){
    fn(err, instance);
  });
}

exports.destroy = function (instance, fn) {
  var batch = new Batch();
  batch.concurrency(1);

  batch.push(login);
  batch.push(function(done){ destroy(done, instance); });
  batch.end(function(err){
    fn(err, instance);
  });
}

function login(done){
  if (!deis.authenticated) {
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

function create(done, instance) {
  deis.apps.create(instance.name, function(err, app) {
    if (err) {
      log('Error creating `%s` app: %s', instance.name, err);
      done(err);
      return;
    }

    log('Deis app created: %o', app);

    instance.setDeisInstance(app);

    done(null);
  });
}

function destroy(done, instance) {
  if (!instance.hasDeisInstance()) {
    return done({msg: 'Instance model `'+instance.name+'` doesnt have any Deis instance attached.'});
  }

  deis.apps.destroy(instance.name, function(err, app) {
    if (err) {
      log('Couldn\'t destroy app with name %s: %s', instance.name, err);
      return done(err);
    }

    instance.unsetDeisInstance();
    log('App destroyed: %o', app);

    done(null);
  });
}

function configurate(done, instance) {
  instance.populate({
    path: 'owner',
    select: 'email'
  }, function(err, owner){
    if (err) {
      log('Error when searching for owner.email on %s.', instance.name, err);
      return done(err);
    }

    var _config = env({
      ORGANIZATION_NAME: instance.title,
      ORGANIZATION_URL: 'http://' + instance.url,
      HOST: instance.url,
      STAFF: instance.owner.email || '',
      MONGO_URL: instance.mongo_url
    });

    deis.config.set(instance.name, _config, function(err, values) {
      if (err) {
        log('Error configurating %s app: %s', instance.name, err);
        return done(err);
      }

      log('Deis app configured: `%s`', instance.name);

      done(null);
    });
  })
}

function deploy(done, instance) {
  // build({
  //   app: instance.name,
  //   controller: deisConfig.controller,
  //   image: deisConfig.image
  // }, function(err){
  //   if (err) {
  //     log('Error building `%s` app: %s', instance.name, err);
  //     return done(err);
  //   }

  //   log('Deis app builded: %s', instance.name);

  //   done(null, instance);
  // });
  deis.builds.create(instance.name, deisConfig.image, function(err, app) {
    if (err) {
      log('Error building `%s` app: %s', instance.name, err);
      return done(err);
    }

    log('Deis app builded: %s', instance.name, app);

    done(null, instance);
  });
}

function save(done, instance) {
  instance.save(function(err){
    if (err) {
      log('Found error: %s', err)
      return done(err);
    }

    done(null, instance);
  });
}
