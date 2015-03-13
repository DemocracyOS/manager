var config = require('lib/config')('deployment db');
var crypto = require('crypto');
var MongoClient = require('mongodb').MongoClient;
var mongodbUri = require('mongodb-uri');
var compose = require('lib/compose-api')(config.compose);
var log = require('lib/debug')('manager:db-handler')
var urlencode = require('urlencode');
var Batch = require('mjlescano-batch');

exports.create = function (name, fn) {
  var database = name + date() + crypto.randomBytes(2).toString('hex');
  var username = name + crypto.randomBytes(12).toString('hex');
  var password = crypto.randomBytes(48).toString('base64');

  var uri = mongodbUri.parse(config.connection);

  uri.database = database;
  uri.username = username;
  uri.password = password;

  uri = urlencode.decode(mongodbUri.format(uri));

  compose.deploymentUserCreate({
    username: username,
    password: password,
    readOnly: false,
    database: database
  }).end(function(res){
    if (!(res.body && res.body.ok)) {
      log('Found Error: ', res);
      return fn('There was an error when creating the database '+database);
    }

    log('Created user "%s" for DB "%s"', username, database);

    fn(null, uri);
  });
}

function date() {
  var d = new Date;
  return [
    d.getFullYear(),
    (d.getMonth() + 1),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds()
  ].join('');
}

exports.drop = function (mongoUrl, fn){
  var uri = mongodbUri.parse(mongoUrl);

  clearDB(mongoUrl, function(err){
    if (err) return fn(err);

    compose.deploymentUserDelete({
      username: uri.username,
      database: uri.database
    }).end(function(res){
      if (!(res.body && res.body.ok)) {
        log('Found Error: %o', res);
        return fn('There was an error when deleting the database user ' + uri.username + ' of DB ' + uri.database);
      }
      log('Deleted Compose user of DB "%s".', uri.database);
      fn(null);
    });
  });
  // var uri = mongodbUri.parse(deployment.mongoUrl);

  // MongoClient.connect(deployment.mongoUrl, function(err, db){
  //   if (err) return fn(err);

  //   db.dropDatabase(function(err){
  //     if (err) return fn(err);

  //     db.close(function(err){
  //       if (err) return fn(err);

  //       compose.deploymentUserDelete({
  //         username: uri.username,
  //         database: uri.database
  //       }).end(function(res){
  //         if (!(res.body && res.body.ok)) {
  //           log('Found Error: %o', res);
  //           return fn('There was an error when deleting the database user ' + uri.username);
  //         }
  //         deployment.mongoUrl = undefined;
  //         fn(null);
  //       });
  //     });
  //   });
  // });
}

function clearDB(url, fn) {
  MongoClient.connect(url, function(err, db) {
    if (err) return fn(err);

    var batch = new Batch();

    log('Clearing database \'%s\'.', db.databaseName);

    db.collections(function(err, collections){
      if (err) return fn(err);

      collections.forEach(function(collection){
        batch.push(function(done){
          if (/^system\./.test(collection.collectionName)) return done(null);
          collection.drop(function(err){
            if (err) return done(err);
            log('Collection \'%s\' dropped.', collection.collectionName);
            done(null);
          });
        });
      });

      batch.end(function(err){
        if (err) return db.close(), fn(err);
        log('Database \'%s\' cleared.', db.databaseName);
        db.close();
        fn(null);
      });
    });
  });
}
