var config = require('lib/config')('instance db');
var MongoClient = require('mongodb').MongoClient;
var log = require('lib/debug')('manager:db-handler');
var crypto = require('crypto');

function mongoUri(data) {
  var uri = 'mongodb://'+data.user+':'+data.password+'@'+data.host;
  return uri + (data.db ? '/'+data.db : '');
}

var adminUri = mongoUri({
  user: config.user,
  password: config.password,
  host: config.host
});

function connect(fn) {
  log('Trying to connect to `%s`', adminUri);
  MongoClient.connect(adminUri, fn);
}

exports.create = function (instance, fn){
  var name = instance.name;

  connect(function(err, db) {
    if (err) return fn(err);

    var adminDb = db.admin();
    var pass = crypto.randomBytes(48).toString('base64');
    adminDb.addUser(name, pass, {
      roles: [{role: 'readWrite', db: name}]
    }, function(err) {
      if (err) return db.close(function(){ fn(err); });

      var uri = mongoUri({
        user: name,
        password: pass,
        host: config.host,
        db: name
      });

      db.close(function(err){
        if (err) return fn(err);
        instance.mongo_url = uri;
        fn(null, uri);
      });
    });
  });
}

exports.drop = function (instance, fn){
  MongoClient.connect(instance.mongo_url, function(err, db){
    if (err) return fn(err);

    db.dropDatabase(function(err){
      if (err) return fn(err);

      removeUser(instance.name, function(err){
        if (err) return fn(err);
        instance.mongo_url = undefined;
        fn(null);
      })
    })
  });
}

function removeUser(name, fn){
  connect(function(err, db) {
    if (err) return fn(err);
    var adminDb = db.admin();
    adminDb.removeUser(name, function(err) {
      if (err) return fn(err);
      db.close(fn);
    });
  });
}
