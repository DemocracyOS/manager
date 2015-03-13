/**
 * Module dependencies.
 */

var express = require('express');
var log = require('lib/debug')('manager:deployment-api');
var api = require('lib/db-api');
var Batch = require('mjlescano-batch');
var pick = require('mout/object/pick');
var mongoose = require('mongoose');
var deploymentHandler = require('lib/deployment-handler');

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
      return done({ code: 400, err: { msg:'Must define a deployment object.' }});
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
  });

  // Validate Owner Existance
  batch.push(function(done){
    if (!mongoose.Types.ObjectId.isValid(data.owner)) {
      return done({ code: 400, err: { msg: 'Owner id invalid.' }});
    }

    api.user.exists(data.owner, function(err, exists){
      if (err) return done({ code: 500, err: err });
      if (!exists) return done({ code: 400, err: { msg: 'Owner not found.' }});
      done(null);
    });
  });

  // Verify the owner doesn't have any instance
  batch.push(function(done){
    api.deployment.exists({ owner: data.owner }, function (err, exists) {
      if (err) return done({ code: 500, err: err });
      if (exists) return done({ code: 400, err: { msg: 'Owner already has a deployment.' }});
      done(null);
    });
  });

  // Create Deployment
  batch.push(function(done){
    deploymentHandler.create(data, function(err, _deployment) {
      if (err) return done({ code: 500, err: err });
      deployment = _deployment;
      done(null);
    });
  });

  batch.end(function(err){
    if (err) {
      log('Found error: %o', err);
      return res.json(err.code, err);
    }
    log('Deployment created "%s"', deployment.name);
    res.json(200, { deployment: deployment.toJSON() });
  });
});

app.delete('/:name', function(req, res) {
  log('DELETE /deployments/%s', req.params.name);

  var name = req.params.name;

  deploymentHandler.destroy(name, function(err){
    if (err) return res.json(500, err);
    log('Initiated Deployment destroy for "%s".', name);
    res.json(200);
  });
});
