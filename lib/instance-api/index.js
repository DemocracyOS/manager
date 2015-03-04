/**
 * Module dependencies.
 */

var express = require('express');
var log = require('lib/debug')('manager:instance-api');
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
 * Define routes for Instance API routes
 */

app.post('/', function(req, res) {
  var batch = new Batch;
  var instance = null;
  var data = req.body.instance;

  batch.concurrency(1);

  // Validate Data Structure
  batch.push(function(done){
    if (!data) {
      return done({ code: 400, err: 'Must define an instance object.' });
    }

    data = pick(data, [
      'name',
      'title',
      'summary',
      'imageUrl',
      'owner',
    ]);

    done(null);
  })

  // Validate Owner Existance
  batch.push(function(done){
    if (!mongoose.Types.ObjectId.isValid(data.owner)) {
      return done({ code: 400, err: 'Owner id invalid.' });
    }

    api.user.exists(data.owner, function(err, exists){
      if (err) return done({ code: 500, err: err });
      if (!exists) return done({ code: 400, err: 'Owner not found.' });
      done(null);
    })
  })

  // Create Model
  batch.push(function(done){
    log('Requested Instance model creation: `%o`', data.name);
    api.instance.create(data, function(err, _instance) {
      if (err) err = { code: 400, err: err };
      else instance = _instance;
      done(err);
    });
  }, function(prev){
    log('Rollbacking instance created on DB because of an error...');
    api.instance.remove(instance, function(err){
      if (!err) log('Instance model rollbacked `%s`.', instance.name);
      prev(err);
    });
  });

  // Create DB
  batch.push(function(done){
    log('Creating DB for `%s`.', instance.name);
    dbHandler.create(instance.name, function(err, uri){
      if (err) return done({ code: 500, err: err });
      done(null);
    })
  }, function(done){
    dbHandler.drop(instance, done);
  });

  // Create Deis App
  batch.push(function(done){
    log('Trying to create a Deis instance for: %o', instance.toJSON());
    deisApi.create(instance, function(err, _instance){
      if (err) {
        err = { code: 500, err: err };
      } else {
        instance = _instance;
        log('Deis instance created: %o', instance.toJSON());
      }
      done(err);
    });
  });

  batch.end(function(err){
    if (err) {
      log('Found error: %o', err);
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
