var config = require('lib/config')('instance db');
var crypto = require('crypto');
var mongodb = require('mongodb');
var mongodbUri = require('mongodb-uri');
var compose = require('lib/compose-api')(config.compose);
var log = require('lib/debug')('manager:db-handler')
var urlencode = require('urlencode');

exports.create = function (instance, fn){
  if (instance.mongo_url) return fn('The instance `%s` already has a database attached.', instance.name);

  var database = instance.name + crypto.randomBytes(12).toString('hex');
  var username = instance.name + crypto.randomBytes(12).toString('hex');
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
      console.log('Found Error: ', res);
      return fn('There was an error when creating the database '+database);
    }

    instance.mongo_url = uri;
    fn(null, uri);
  });
}

exports.drop = function (instance, fn){

  fn(null); // <== ARREGLAME

  // var uri = mongodbUri.parse(instance.mongo_url);

  // mongodb.MongoClient.connect(instance.mongo_url, function(err, db){
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
  //           console.log('Found Error: ', res);
  //           return fn('There was an error when deleting the database user ' + uri.username);
  //         }

  //         instance.mongo_url = undefined;
  //         fn(null);
  //       });
  //     });
  //   });
  // });
}
