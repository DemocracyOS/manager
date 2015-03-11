var config = require('lib/config')('deployment db');
var crypto = require('crypto');
var MongoClient = require('mongodb').MongoClient;
var mongodbUri = require('mongodb-uri');
var compose = require('lib/compose-api')(config.compose);
var log = require('lib/debug')('manager:db-handler')
var urlencode = require('urlencode');

exports.create = function (deployment, fn){
  if (deployment.mongo_url) return fn('The deployment \'%s\' already has a database attached.', deployment.name);

  var database = deployment.name + date() + crypto.randomBytes(2).toString('hex');
  var username = deployment.name + crypto.randomBytes(12).toString('hex');
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

    deployment.mongo_url = uri;
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
    d.getMinutes()
  ].join('-');
}

exports.drop = function (deployment, fn){

  fn(null); // <== ARREGLAME

  log('Clearing database of \'%s\'.', deployment.name);

  // var uri = mongodbUri.parse(deployment.mongo_url);

  // MongoClient.connect(deployment.mongo_url, function(err, db){
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

  //         deployment.mongo_url = undefined;
  //         fn(null);
  //       });
  //     });
  //   });
  // });
}

function clearDB(url, fn) {

  MongoClient.connect(url, function(err, db) {
    if (err) return fn(err);

    db.collectionNames(function(err, collections){
      if (err) return fn(err);
      dropCollections(db, collections);
    });
  });
}

function dropCollections(db, colls){
    for(var i = 0; i < colls.length; i++){
        var name = colls[i].name.substring('lettbo_prod2.'.length);
        if ( name.substring(0, 6) !== "system"){
            db.dropCollection(name, function(err) {
                if(!err) {
                    console.log( name + " dropped");
                } else {
                    console.log("!ERROR! " + err.errmsg);
                }
            });
        } else {
            console.log(name + " cannot be dropped because it's a system file");
        }
    }
}