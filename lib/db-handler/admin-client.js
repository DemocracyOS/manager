var mongodbUri = require('mongodb-uri');
var mongodb = require('mongodb');

module.exports = AdminClient;

function AdminClient(url) {
  if (!(this instanceof AdminClient)) return new AdminClient(url);

  this.url = url;
  this.uri = mongodbUri.parse(url);

  this.client = null;
  this.pending = [];
  this.connecting = false;

  this.connect = this.connect.bind(this);
}

AdminClient.prototype.connect = function connect(fn) {
  var self = this;

  if (this.client) return fn && fn(null, this.client);
  if (fn) this.pending.push(fn);
  if (this.connecting) return;

  this.connecting = true;


  open(this.uri, function(err, client){
    if (err) throw err;

    self.client = client;

    if (self.pending.length) {
      self.pending.forEach(self.connect);
      self.pending.length = 0;
    }
  });
}

function createServer(host) {
  return new mongodb.Server(host.host, host.port);
}

function createServers(hosts) {
  if (hosts.length === 1) {
    return createServer(hosts[0]);
  } else if (hosts.length > 1) {
    return new mongodb.ReplSetServers(hosts.map(createServer));
  } else {
    throw new Error('Must provide a valid mongodb server uri string.');
  }
}

function open(uri, fn) {
  var mongoClient = new mongodb.MongoClient(createServers(uri.hosts));

  mongoClient.open(function(err, newClient){
    if (err) return fn(err);

    var adminDb = newClient.db('admin');

    adminDb.authenticate(uri.username, uri.password, function(err){
      if (err) return fn(err);
      fn(null, newClient);
    });
  });
}
