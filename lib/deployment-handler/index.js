var log = require('lib/debug')('manager:deployment-handler');
var mongoose = require('mongoose');
var api = require('lib/db-api');
var Batch = require('mjlescano-batch');
var dbHandler = require('lib/db-handler');
var deisApi = require('lib/deis-api');
var env = require('./env');
var request = require('superagent');

/*
  deploymentHandler = require('lib/deployment-handler');
  deploymentHandler.create({ name: 'gaga', title: 'Sarasa', owner: '54eb6ab10eabd7d1254b1d88'}, function(err, deployment){ console.log(err); console.log(deployment);});
  deploymentHandler.destroy('gaga', function(err){ console.log(err); console.log('lesto.') })
*/

exports.create = function(data, fn) {
  var batch = new Batch;
  var deployment = null;

  data.status = 'creating';

  log('Creating Deployment "%s"', data.name);

  batch.concurrency(1);

  // Validate Data.
  batch.push(function(done){
    exports.validateData(data, done);
  });

  // Create Model.
  batch.push(function(done){
    exports.createModel(data, function(err, _deployment) {
      if (err) return fn(err);
      deployment = _deployment;
      done(null);
    });
  });

  // Done.
  batch.end(function(err){
    if (err) {
      log('Error creating Deployment "%s"', data.name);
      return fn(err);
    }

    log('Deployment created "%s"', deployment.name);

    setTimeout(function(){
      exports.createDBandDeis(deployment);
    }, 0);

    fn(null, deployment);
  });
}

exports.destroy = function(name, fn) {
  var batch = new Batch;
  var deployment = null;

  batch.concurrency(1);

  log('Destroying Deployment "%s"', name);

  // Find Deployment
  batch.push(function(done){
    api.deployment.get(name, function (err, _deployment) {
      if (err) return done(err);
      if (!_deployment) return done(new Error('Deployment not found.'));

      deployment = _deployment

      if (deployment.status !== 'ready') {
        return done(new Error('Only deployments with status "ready" can be destroyed: "'+name+'" has "'+deployment.status+'".'));
      }

      done(null);
    });
  });

  // Set 'destroying' status
  batch.push(function(done){
    deployment.setStatus('destroying', function(err){
      if (err) return done(err);
      log('Setted "destroying" status on "%s"', name);
      done(null);
    });
  });

  batch.end(function(err){
    if (err) {
      log('Error destroying "%s"', name);
      return;
    }

    setTimeout(function(){
      exports.destroyDBandDeis(deployment);
    }, 0);

    fn(null);
  });
}

exports.validateData = function(data, fn) {
  var batch = new Batch;
  batch.concurrency(1);

  log('Validating data for "%s"', data.name);

  // Validate Owner Existance
  batch.push(function(done){
    if (!mongoose.Types.ObjectId.isValid(data.owner)) {
      return done(new Error('Owner id invalid.'));
    }

    api.user.exists(data.owner, function(err, exists){
      if (err) return done(err);
      if (!exists) return done(new Error('Owner not found.'));
      done(null);
    });
  });

  // Verify the owner doesn't have any instance
  batch.push(function(done){
    api.deployment.exists({ owner: data.owner }, function (err, exists) {
      if (err) return done(err);
      if (exists) return done(new Error('Owner already has a deployment.'));
      done(null);
    });
  });

  batch.end(function(err){
    if (err) return log('Found error: %o', err), fn(err);
    log('Data is valid of "%s"', data.name);
    fn(null);
  });
}

exports.createModel = function(data, fn) {
  log('Creating Deployment model "%s"', data.name);
  api.deployment.create(data, function(err, deployment) {
    if (err) {
      log('Found error creating model "%s": %o', deployment.name, err);
      return fn(err);
    }
    log('Created Deployment model "%s"', deployment.name);
    fn(null, deployment);
  });
}

exports.destroyModel = function(deployment, fn) {
  log('Deleting Deployment model "%s"', deployment.name);
  api.deployment.remove(deployment, function(err){
    if (err) {
      log('Found error deleting model "%s": %o', deployment.name, err);
      return fn(err);
    }
    fn(null);
  });
}

exports.createDBandDeis = function(deployment) {
  var batch = new Batch;

  batch.concurrency(1);

  log('Called createDBandDeis with "%s"', deployment.name);

  // Create DB
  batch.push(function(done){
    if (deployment.mongoUrl) return done(new Error('The deployment already has a DB attached.'));
    exports.createDB(deployment, done);
  }, function(done){
    if (!deployment.mongoUrl) return done(new Error('The deployment doesn\'t have a DB attached.'));
    exports.destroyDB(deployment, done);
  });

  // Create Deis App
  batch.push(function(done){
    if (!deployment.canAssignDeisDeployment()) {
      return done(new Error('The deployement already has a Deis instance attached.'));
    }
    exports.createDeis(deployment, done);
  });

  batch.push(function (done) {
    var retries = 10;

    function get() {
      request
        .get(':hostname/api'.replace(':hostname', deployment.url)
        .end(function (err, res) {
            if (err) return log('Error requesting for GET: %s/api', deployment.url), done(err);

            if (res.status == 503) {
              log('%s is still not available, retrying in 1 second', deployment.url);
              retries--;
              if (retries != 0) return setTimeout(get, 1000);

              log('%s is still not available after 10 retries, giving up', deployment.url);
              done(new Error('The deployment ' + deployment.id + ' is not up after retrying 10 times'))
            } else if (res.status == 200) {
              log('Deployment %s is ready to access on %s', deployment.id, deployment.url);
              done(null);
            } else {
              log('Deployment %s responded with status %d on %s', deployment.id, res.status, deployment.url);
              return done(new Error('Deployment ' + deployment.id + ' responded with status ' + res.status + ' on ' + deployment.url));
            }
        });
    }

    setTimeout(get, 1000);
  });

  // Save Model
  batch.end(function(err){
    if (err) {
      log('There was an error when creating Deployment "%s".', err);
      log('Destroying deployment model "%o".', deployment.toJSON());

      exports.destroyModel(deployment, function(err) {
        if (err) throw err;
        log('Deployment model destroyed "%s".', deployment.name);
      });
    } else {
      deployment.setStatus('ready', function(err){
        if (err) throw err;
        log('Setted "ready" status on "%s"', deployment.name);
      });
    }
  });
}

exports.destroyDBandDeis = function(deployment) {
  var batch = new Batch;

  batch.concurrency(2);

  log('Called createDBandDeis with "%s"', deployment.name);

  // Destroy DB
  batch.push(function(done){
    if (!deployment.mongoUrl) return done(new Error('The deployment doesn\'t have a DB attached.'));
    exports.destroyDB(deployment, done);
  });

  // Destroy Deis App
  batch.push(function(done){
    if (!deployment.hasDeisDeployment()) {
      return done(new Error('The deployement doesn\'t have a Deis instance attached.'));
    }
    exports.destroyDeis(deployment, done);
  });

  // Destroy Model
  batch.end(function(err){
    if (err) {
      log('There was an error when destroying deployment "%s".', err);

      deployment.setStatus('error', function(err){
        if (err) throw err;
        log('Setted "error" status on "%s"', deployment.name);
      });
    } else {
      exports.destroyModel(deployment, function(err) {
        if (err) throw err;
        log('Deployment destroyed "%s".', deployment.name);
      });
    }
  });
}

exports.createDB = function(deployment, fn) {
  log('Creating DB for "%s".', deployment.name);

  dbHandler.create(deployment.name, function(err, uri){
    if (err) return fn(err);
    log('DB created for "%s".', deployment.name);
    deployment.mongoUrl = uri;
    fn(null);
  });
}

exports.destroyDB = function(deployment, fn) {
  log('Dropping DB of "%s".', deployment.name);

  dbHandler.drop(deployment.mongoUrl, function(err){
    if (err) return fn(err);
    log('DB dropped of "%s".', deployment.name);
    deployment.mongoUrl = undefined;
    fn(null);
  });
}

exports.createDeis = function(deployment, fn) {
  deisApi.create(deployment.name, function(err, app){
    if (err) return fn(err);

    deployment.setDeisDeployment(app);

    deployment.populate({
      path: 'owner',
      select: 'email'
    }, function(err){
      if (err) {
        log('Error when searching for owner.email on deployment "%s".', deployment.name, err);
        return fn(err);
      }

      var environment = env({
        HOST: deployment.url,
        MONGO_URL: deployment.mongoUrl,
        STAFF: deployment.owner.email,
        ORGANIZATION_NAME: deployment.title,
        ORGANIZATION_URL: 'http://' + deployment.url,
        DEPLOYMENT_ID: deployment._id
      });

      deisApi.deploy(deployment.name, environment, function(err){
        if (err) return fn(err);
        fn(null);
      });
    });
  });
}

exports.destroyDeis = function(deployment, fn) {
  deisApi.destroy(deployment.name, function(err){
    if (err) return fn(err);
    deployment.unsetDeisDeployment();
    fn(null);
  });
}
