var log = require('lib/debug')('manager:db-handler')
var config = require('lib/config');
var crypto = require('crypto');
var mongodbUri = require('mongodb-uri');
var urlencode = require('urlencode');
var AdminClient = require('./admin-client');

var adminClient = new AdminClient(config('deployment db server'));

exports.create = function (name, fn) {
  var database = [name, date(), crypto.randomBytes(2).toString('hex')].join('-');
  var username = name + '-' + crypto.randomBytes(12).toString('hex');
  var password = crypto.randomBytes(48).toString('base64');

  var uri = mongodbUri.parse(config('deployment db server'));

  uri.database = database;
  uri.username = username;
  uri.password = password;

  uri = urlencode.decode(mongodbUri.format(uri));

  adminClient.connect(function(err, client){
    if (err) return fn(err);

    var db = client.db(database);

    db.addUser(username, password, {
      roles: [{ role: 'readWrite', db: database }]
    }, function(err) {
      if (err) return fn(err);
      log('User "%s" created for database "%s".', username, database);
      fn(null, uri);
    });
  });
}

function date() {
  var d = new Date;
  return [
    d.getFullYear(),
    (d.getMonth() + 1),
    d.getDate(),
    d.getHours(),
    d.getMinutes()
  ].join('-');
}

exports.drop = function (mongoUrl, fn){
  var uri = mongodbUri.parse(mongoUrl);

  adminClient.connect(function(err, client){
    if (err) return fn(err);

    var db = client.db(uri.database);

    db.removeUser(uri.username, function(err) {
      if (err) return fn(err);

      log('User "%s" of database "%s" removed.', uri.username, uri.database);

      db.dropDatabase(function(err) {
        if (err) return fn(err);

        log('Database "%s" dropped.', uri.database);

        fn(null);
      });
    });
  });
}
