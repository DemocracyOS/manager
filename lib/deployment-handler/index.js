var log = require('lib/debug')('manager:deployment-handler');
var mongoose = require('mongoose');
var api = require('lib/db-api');
var Batch = require('mjlescano-batch');
var dbHandler = require('lib/db-handler');

/*
  deploymentHandler = require('lib/deployment-handler');
  deploymentHandler.create({ name: 'sarasa', title: 'Sarasa', owner: '54eb6ab10eabd7d1254b1d88'}, function(err, deployment){ console.log(err); console.log(deployment);});
  deploymentHandler.destroy('sarasa', function(err){ console.log(err); console.log('lesto.') })
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

    fn(null);
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
      return fn(err);
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

  log('Called createDBandDeis with "%s"', deployment.name);

  batch.push(function(done){

  });

  batch.end(function(err){
    if (err) {
      deployment.setStatus();
      return;
    }
    log();
  });

  deployment.setStatus('ready', function(err){
    if (err) return log('error!');
    log('ok!')
  });
}

exports.destroyDBandDeis = function(deployment) {
  exports.destroyModel(deployment, function(err) {
    if (err) return log('error!');
    log('ok!');
  });
}

exports.createDB = function(deployment, fn) {
  dbHandler.create(deployment.name, function(err){
    if (err) return done({ code: 500, err: err });
    done(null);
  });
}
