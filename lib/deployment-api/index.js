/**
 * Module dependencies.
 */

var express = require('express');
var log = require('lib/debug')('manager:deployment-api');
var api = require('lib/db-api');
var deisApi = require('lib/deis-api');
var Batch = require('mjlescano-batch');
var pick = require('mout/object/pick');
var mongoose = require('mongoose');
var dbHandler = require('lib/db-handler');

/**
 * Exports Application
 */

var app = module.exports = express();

/**
 * Define routes for Deployment API routes
 */

app.post('/', function(req, res) {
  var batch = new Batch;
  var deployment = null;
  var data = req.body.deployment;

  batch.concurrency(1);

  // Validate Data Structure
  batch.push(function(done){
    if (!data) {
      return done({ code: 400, err: { msg:'Must define an deployment object.' }});
    }

    data = pick(data, [
      'name',
      'title',
      'summary',
      'imageUrl',
      'owner',
    ]);

    log('Request landed for creationd of: %o', data);

    done(null);
  })

  // Validate Owner Existance
  batch.push(function(done){
    if (!mongoose.Types.ObjectId.isValid(data.owner)) {
      return done({ code: 400, err: { msg: 'Owner id invalid.' }});
    }

    api.user.exists(data.owner, function(err, exists){
      if (err) return done({ code: 500, err: err });
      if (!exists) return done({ code: 400, err: { msg: 'Owner not found.' }});
      done(null);
    })
  })

  // Create Model
  batch.push(function(done){
    log('Requested Deployment model creation: "%o"', data.name);
    api.deployment.create(data, function(err, _deployment) {
      if (err) return done({ code: 400, err: err });
      deployment = _deployment;
      done(null);
    });
  }, function(prev){
    log('Rollbacking deployment created on DB because of an error...');
    api.deployment.remove(deployment, function(err){
      if (!err) log('Deployment model rollbacked "%s".', deployment.name);
      prev(err);
    });
  });

  // Create DB
  batch.push(function(done){
    log('Creating DB for "%s".', deployment.name);
    dbHandler.create(deployment, function(err){
      if (err) return done({ code: 500, err: err });
      done(null);
    })
  }, function(done){
    log('Dropping database "%s"', deployment.name);
    dbHandler.drop(deployment, done);
  });

  // Create Deis App
  batch.push(function(done){
    log('Trying to create a Deis deployment for: %o', deployment.toJSON());
    deisApi.create(deployment, function(err){
      if (err) return done({ code: 500, err: err });
      log('Deis deployment created: "%s"', deployment.name);
      done(err);
    });
  });

  // Save Model
  batch.push(function(done){
    deployment.save(function(err){
      if (err) return done({ code: 500, err: err });
      log('Saved deployment "%s"', deployment.name);
      done(null);
    })
  });

  batch.end(function(err){
    if (err) {
      log('Found error: %o', err);
      return res.json(err.code, err);
    }
    res.json(200, { deployment: deployment.toJSON() });
  });
});

app.delete('/:name', function(req, res) {
  log('DELETE /deployments/%s', req.params.name);

  var name = req.params.name;
  var batch = new Batch;
  var deployment = null;

  batch.concurrency(1);

  // Find Deployment
  batch.push(function(done){
    api.deployment.get(name, function (err, _deployment) {
      if (err) return done({ code: 500, err: err });

      if (!_deployment) {
        return done({ code: 400, err: { msg: 'Deployment not found.' }});
      }

      deployment = _deployment
      done(null);
    });
  });

  // Destroy Deis Instance
  batch.push(function(done){
    deisApi.destroy(deployment, function(err){
      if (err) return done({ code: 500, err: err });
      log('Deis deployment destroyed: "%s"', deployment.name);
      done(null);
    });
  });

  // Drop Deployment DB
  batch.push(function(done){
    log('Dropping database "%s"', deployment.name);
    dbHandler.drop(deployment, done);
  });

  // Delete from DB
  batch.push(function(done){
    api.deployment.remove(deployment, function(err){
      if (err) return done({ code: 500, err: err });
      log('Deployment model deleted "%s"', deployment.name);
      done(null);
    });
  });

  batch.end(function(err){
    if (err) {
      log('Found error: %s', err);
      return res.json(err.code, err);
    }
    log('Correctly deleted Deployment "%s"', deployment.name);
    res.json(200, { deployment: deployment.toJSON() });
  });
});
