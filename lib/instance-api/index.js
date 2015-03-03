/**
 * Module dependencies.
 */

var express = require('express');
var log = require('lib/debug')('manager:instance-api');
var api = require('lib/db-api');
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

  batch.push(function(done){
    var data = req.body.instance;
    log('Requested Instance creation: %o', data);

    if (!data) {
      var err = 'Must define an instance object.';
      log('Found error: %s', err);
      return done({ code: 400, err: err });
    }

    api.instance.create(data, function(err, _instance) {
      if (err) log('Found error: %s', err), err = { code: 400, err: err };
      else instance = _instance;
      done(err);
    });
  }, function(prev){
    log('Rollbacking instance created on DB because of an error...');
    api.instance.remove(instance, function(err){
      if (err) log('Found error: %s', err);
      else log('Instance rollbacked on DB: %s', instance);
      prev(err);
    });
  });

  batch.push(function(done){
    log('Trying to create a Deis instance for: %o', instance.toJSON());
    deisApi.create(instance, function(err, _instance){
      if (err) {
        log('Found error: %s', err), err = { code: 500, err: err };
      } else {
        instance = _instance;
        log('Deis instance created: %o', instance.toJSON());
      }
      done(err);
    });
  });

  batch.end(function(err){
    if (err) {
      log('Found error: %s', err);
      return res.json(err.code, err.err);
    }
    res.json(200, { instance: instance.toJSON() });
  });
});

app.delete('/:name', function(req, res) {
  log('DELETE /instances/%s', req.params.name);

  var name = req.params.name;
  var batch = new Batch;
  var instance = null;

  batch.concurrency(1);

  batch.push(function(done){
    api.instance.get(name, function (err, _instance) {
      if (err) {
        log('Found error: %s', err);
        return done({ code: 400, err: err });
      }

      if (!_instance) {
        return done({ code: 400, err: { msg: 'Instance not found.' }});
      }

      instance = _instance
      done(null);
    });
  });

  batch.push(function(done){
    deisApi.destroy(instance, function(err){
      if (err) {
        err = { code: 500, err: err };
      } else {
        log('Deis instance destroyed: %o', instance.toJSON());
      }
      done(err);
    });
  });

  batch.push(function(done){
    api.instance.remove(instance, function(err){
      if (err) {
        err = { code: 500, err: err };
      } else {
        log('Instance model deleted: %o', instance.toJSON());
      }
      done(err);
    });
  });

  batch.end(function(err){
    if (err) {
      log('Found error: %s', err);
      return res.json(err.code, err.err);
    }
    res.json(200, { instance: instance.toJSON() });
  });
});
