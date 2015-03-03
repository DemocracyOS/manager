/**
 * Module dependencies.
 */

var express = require('express');
var log = require('lib/debug')('manager:instance-api');
var dbApi = require('lib/db-api');
var deisApi = require('lib/deis-api');
var Batch = require('mjlescano-batch');

/**
 * Exports Application
 */

var app = module.exports = express();

/**
 * Define routes for Instance API routes
 */

app.post('/', function(req, res) {
  var batch = new Batch;
  var instance = null;

  batch.concurrency(1);

  batch.push(function(next){
    var data = req.body.instance;

    if (!data) {
      var err = 'Must define an instance object.';
      log('Found error: %s', err);
      return next({ code: 400, err: err });
    }

    dbApi.instance.create(data, function(err, _instance) {
      if (err) log('Found error: %s', err), err = { code: 400, err: err };
      else instance = _instance;
      next(err);
    });
  }, function(prev){
    log('Rollbacking instance created on DB because of an error...');
    dbApi.instance.remove(instance, function(err){
      if (err) log('Found error: %s', err);
      else log('Instance rollbacked on DB: %s', instance);
      prev(err);
    });
  });

  batch.push(function(next){
    log('Trying to create a Deis instance for: %o', instance.toJSON());
    deisApi.create(instance, function(err, _instance){
      if (err) {
        log('Found error: %s', err), err = { code: 500, err: err };
      } else {
        instance = _instance;
        log('Deis instance created: %o', instance.toJSON());
      }
      next(err);
    });
  });

  batch.end(function(err){
    if (err) return res.json(err.code, err.err);
    res.json(200, { instance: instance.toJSON() });
  });
});
