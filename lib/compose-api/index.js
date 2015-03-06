/**
 * Compose API wrapper
 * https://docs.compose.io/rest-api/2014-06/introduction.html
 */

var request = require('superagent');

module.exports = Api;

function Api(config){
  if (!(this instanceof Api)) return new Api(config);
  this.config = config;
  this.base = this.base.bind(this)
}

Api.prototype.base = function(req){
  req
    .set('Accept-Version', '2014-06')
    .type('application/json')
    .set('Authorization', 'Bearer ' + this.config.token);
  return req;
}

Api.prototype.accounts = function(){
  var r = request
    .get('https://api.compose.io/accounts')
    .use(this.base);
  return r;
}

Api.prototype.deployments = function(){
  var r = request
    .get('https://api.compose.io/accounts/' + this.config.account + '/deployments')
    .use(this.base);
  return r;
}

Api.prototype.deployment = function(){
  var r = request
    .get('https://api.compose.io/deployments/' + this.config.account + '/' + this.config.deployment)
    .use(this.base);
  return r;
}

Api.prototype.deploymentDbVersion = function(){
  var r = request
    .get('https://api.compose.io/deployments/' + this.config.account + '/' + this.config.deployment + '/version')
    .use(this.base);
  return r;
}

Api.prototype.deploymentDbCreate = function(data){
  // var data = {
  //   username: 'test',
  //   password: 'supersecret',
  //   readOnly: false
  // }
  var r = request
    .post('https://api.compose.io/deployments/' + this.config.account + '/' + this.config.deployment + '/mongodb/' + data.database + '/users')
    .send(data)
    .use(this.base);
  return r;
}

Api.prototype.deploymentDbDelete = function(data){
  var r = request
    .post('https://api.compose.io/deployments/' + this.config.account + '/' + this.config.deployment + '/databases')
    .send(data)
    .use(this.base);
  return r;
}
