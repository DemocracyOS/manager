var config = require('lib/config');
var log = require('lib/debug')('manager:deis-api');
var DeisAPI = require('deis-api');
var env = require('./env');
var crypto = require('crypto');
var Batch = require('mjlescano-batch');

var deisConfig = config('deis');
var deis = new DeisAPI({
  controller: deisConfig.controller,
  username: deisConfig.username,
  password: deisConfig.password
});

exports.create = function (instance, fn) {
  var err = null;

  if (!instance.canAssignDeisInstance()) {
    err = '`instance` model can\'t be assigned with a deis instance.';
    return fn(err);
  }

  var batch = new Batch();

  batch.concurrency(1);

  batch.push(login);

  batch.push(
    function(done){ create(done, instance); },
    function(done){ createRollback(done, instance); }
  );

  batch.push(function(done){ configurate(done, instance); });

  batch.push(function(done){ deploy(done, instance); });

  batch.push(function(done){ save(done, instance); });

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

function createRollback(done, instance) {
  deis.apps.destroy(instance.name, function(err, app) {
    if (err) {
      log('Couldn\'t destroy app with name %s on error: %s', app.id, err);
      return done(err);
    }

    instance.unsetDeisInstance();
    log('App destroyed on error: %s', app.id);

    done(null);
  });
}

function configurate(done, instance) {
  var _config = env({
    ORGANIZATION_NAME: instance.title,
    HOST: instance.url,
    JWT_SECRET: crypto.randomBytes(20).toString('hex'),
    STAFF: []
  });

  deis.config.set(instance.name, _config, function(err, values) {
    if (err) {
      log('Error configurating %s app: %s', instance.name, err);
      return done(err);
    }

    log('Deis app configured: %s', instance.name, values);

    done(null);
  });
}

function deploy(done, instance) {
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