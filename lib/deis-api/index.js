var config = require('lib/config');
var log = require('lib/debug')('manager:deis-api');
var DeisAPI = require('deis-api');
var Batch = require('mjlescano-batch');
var env = require('./env');
// var build = require('./build');

var deisConfig = config('deis');
var deis = new DeisAPI({
  controller: deisConfig.controller,
  username: deisConfig.username,
  password: deisConfig.password
});

exports.create = function (deployment, fn) {
  var err = null;

  if (!deployment.canAssignDeisDeployment()) {
    err = { msg: '\'deployment\' model can\'t be assigned with a deis deployment: ' + deployment.name };
    return fn(err);
  }

  var batch = new Batch();

  batch.concurrency(1);

  batch.push(login);

  batch.push(
    function(done){ create(done, deployment); },
    function(done){ destroy(done, deployment); }
  );

  batch.push(function(done){ configurate(done, deployment); });

  batch.push(function(done){ deploy(done, deployment); });

  batch.push(function(done){ save(done, deployment); });

  batch.end(function(err){
    fn(err, deployment);
  });
}

exports.destroy = function (deployment, fn) {
  var batch = new Batch();
  batch.concurrency(1);

  batch.push(login);
  batch.push(function(done){ destroy(done, deployment); });
  batch.end(function(err){
    fn(err, deployment);
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

function create(done, deployment) {
  deis.apps.create(deployment.name, function(err, app) {
    if (err) {
      log('Error creating \'%s\' app: %s', deployment.name, err);
      done(err);
      return;
    }

    log('Deis app created: %o', app);

    deployment.setDeisDeployment(app);

    done(null);
  });
}

function destroy(done, deployment) {
  if (!deployment.hasDeisDeployment()) {
    return done({msg: 'Deployment model \''+deployment.name+'\' doesnt have any Deis deployment attached.'});
  }

  deis.apps.destroy(deployment.name, function(err, app) {
    if (err) {
      log('Couldn\'t destroy app with name %s: %s', deployment.name, err);
      return done(err);
    }

    deployment.unsetDeisDeployment();
    log('Deis instance destroyed: %s.', deployment.name);

    done(null);
  });
}

function configurate(done, deployment) {
  deployment.populate({
    path: 'owner',
    select: 'email'
  }, function(err){
    if (err) {
      log('Error when searching for owner.email on %s.', deployment.name, err);
      return done(err);
    }

    var _config = env({
      HOST: deployment.url,
      MONGO_URL: deployment.mongo_url,
      STAFF: deployment.owner.email,
      ORGANIZATION_NAME: deployment.title,
      ORGANIZATION_URL: 'http://' + deployment.url,
      DEPLOYMENT_ID: deployment._id
    });

    deis.config.set(deployment.name, _config, function(err, values) {
      if (err) {
        log('Error configurating %s app: %s', deployment.name, err);
        return done(err);
      }

      log('Deis app configured: \'%s\'', deployment.name);

      done(null);
    });
  })
}

function deploy(done, deployment) {
  // build({
  //   app: deployment.name,
  //   controller: deisConfig.controller,
  //   image: deisConfig.image
  // }, function(err){
  //   if (err) {
  //     log('Error building \'%s\' app: %s', deployment.name, err);
  //     return done(err);
  //   }

  //   log('Deis app builded: %s', deployment.name);

  //   done(null, deployment);
  // });
  var registry = config('deployment internal registry') || '';
  var image = config('deployment image');

  if (image && image[0] === '/') image.slice(0, 1);

  if (registry && registry[registry.length - 1] !== '/') registry += '/';

  var dock = registry + image;

  log('Building Deis app "%s" with docker image ""', deployment.name, dock);
  deis.builds.create(deployment.name, dock, function(err, app) {
    if (err) {
      log('Error building "%s" using image "%s": %s', deployment.name, dock, err);
      return done(err);
    }

    log('Deis app builded: %s', deployment.name, app);

    done(null, deployment);
  });
}

function save(done, deployment) {
  deployment.save(function(err){
    if (err) {
      log('Found error: %s', err)
      return done(err);
    }

    done(null, deployment);
  });
}
