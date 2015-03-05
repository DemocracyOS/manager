var config = require('lib/config')('instance db');
var crypto = require('crypto');
var mongodbUri = require('mongodb-uri');
var mongodb = require('mongodb');

config.hosts = mongodbUri.parse(config.host).hosts;

function adminDb(fn) {
  var replSet = new mongodb.ReplSetServers(config.hosts.map(function(url){
    return new mongodb.Server(url.host, url.port, { logger: console });
  }));

  var DB = new mongodb.Db('admin', replSet, { w: 'majority', logger: console });

  DB.open(function(err, db){
    if (err) return fn(err);
    db.authenticate(config.admin.user, config.admin.password, function(err){
      if (err) return fn(err);
      fn(null, db);
    });
  });
}

exports.create = function (instance, fn){
  var name = instance.name;
  var pass = crypto.randomBytes(48).toString('base64');
  var uri = mongodbUri.format({
    username: name,
    password: pass,
    hosts: config.hosts,
    database: name
  });

  adminDb(function(err, db) {
    if (err) return db.close(function(){ fn(err); });

    db.addUser(name, pass, {
      roles: [{role: 'readWrite', db: name}]
    }, function(err) {
      if (err) return db.close(function(){ fn(err); });
      db.close(function(err){
        if (err) return fn(err);
        instance.mongo_url = uri;
        fn(null, uri);
      });
    });
  });
}

exports.drop = function (instance, fn){
  mongodb.MongoClient.connect(instance.mongo_url, function(err, db){
    if (err) return fn(err);

    db.dropDatabase(function(err){
      if (err) return fn(err);

      db.close(function(err){
        if (err) return fn(err);
        removeUser(instance.name, function(err){
          if (err) return fn(err);
          instance.mongo_url = undefined;
          fn(null);
        });
      });
    });
  });
}

function removeUser(name, fn){
  adminDb(function(err, db) {
    if (err) return fn(err);
    db.removeUser(name, function(err) {
      if (err) return fn(err);
      log('DB User deleted `%s`', name);
      db.close(fn);
    });
  });
}
