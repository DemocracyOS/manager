/**
 * Compose API wrapper
 * https://docs.compose.io/rest-api/2014-06/introduction.html
 */

var request = require('superagent');
var pick = require('mout/object/pick');

module.exports = Api;

function Api(config){
  if (!(this instanceof Api)) return new Api(config);
  this.c = this.config = config;
  this.base = this.base.bind(this)
}

function uri() {
  var args = Array.prototype.slice.call(arguments)
  return ['https://api.compose.io'].concat(args).join('/')
}

Api.prototype.base = function(req){
  req
    .set('Accept-Version', '2014-06')
    .type('application/json')
    .set('Authorization', 'Bearer ' + this.c.token);
  return req;
}

Api.prototype.accounts = function(){
  var r = request
    .get(uri('/accounts'))
    .use(this.base);
  return r;
}

Api.prototype.deployments = function(){
  var r = request
    .get(uri('accounts', this.c.account, 'deployments'))
    .use(this.base);
  return r;
}

Api.prototype.deployment = function(){
  var r = request
    .get(uri('deployments', this.c.account, this.c.deployment))
    .use(this.base);
  return r;
}

Api.prototype.deploymentVersion = function(){
  var r = request
    .get(uri('deployments', this.c.account, this.c.deployment, 'version'))
    .use(this.base);
  return r;
}

Api.prototype.deploymentDatabases = function(){
  var r = request
    .get(uri('deployments', this.c.account, this.c.deployment, 'databases'))
    .use(this.base);
  return r;
}

Api.prototype.deploymentDatabase = function(data){
  var r = request
    .get(uri('deployments', this.c.account, this.c.deployment, 'databases', data.database))
    .use(this.base);
  return r;
}

Api.prototype.deploymentUsers = function(data){
  var r = request
    .get(uri('deployments', this.c.account, this.c.deployment, 'mongodb', data.database, 'users'))
    .use(this.base);
  return r;
}

Api.prototype.deploymentUserCreate = function(data){
  var r = request
    .post(uri('deployments', this.c.account, this.c.deployment, 'mongodb', data.database, 'users'))
    .send(pick(data, 'username', 'password', 'readOnly'))
    .use(this.base);
  return r;
}

Api.prototype.deploymentUserDelete = function(data){
  var r = request
    .del(uri('deployments', this.c.account, this.c.deployment, 'mongodb', data.database, 'users', data.username))
    .use(this.base);
  return r;
}
