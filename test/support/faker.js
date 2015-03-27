var User = require('lib/models').User;
var Deployment = require('lib/models').Deployment;
var crypto = require('crypto');

function fakerUserCreate (done) {
  var user = new User({
    email: 'fake-' + crypto.randomBytes(8).toString('hex') + '@fakedomain.com.foo'
  });
  user.save(done);
}

function fakerUserDelete (user, done) {
  user.remove(done);
}

function fakerUserAttach (done) {
  var self = this;
  fakerUserCreate(function(err, user){
    if (err) throw err;
    self.user = user;
    done(null);
  });
}

function fakerUserDetach (done) {
  var self = this;
  fakerUserDelete(this.user, function(err){
    if (err) throw err;
    self.user = undefined;
    done(null);
  });
}

function fakerDeploymentCreate (user, done) {
  var deployment = new Deployment({
    name: 'fake-democracy-' + crypto.randomBytes(8).toString('hex'),
    title: 'Fake Democracy',
    owner: user._id,
    status: 'creating'
  });

  deployment.save(done);
}

function fakerDeploymentDelete (done) {
  if (!this.deployment) return done(null);
  this.deployment.remove(done);
}

function fakerDeploymentAttach (done) {
  var self = this;

  if (!this.user) {
    return fakerUserAttach.bind(this)(function(){
      fakerDeploymentAttach.bind(self)(done);
    });
  }

  fakerDeploymentCreate(this.user, function(err, deployment){
    if (err) throw err;
    self.deployment = deployment;
    done(null);
  });
}

function fakerDeploymentDetach (done) {
  var self = this;
  fakerDeploymentDelete(this.deployment, function(err){
    if (err) throw err;
    self.deployment = undefined;
    done(null);
  });
}

module.exports = {
  user: {
    create: fakerUserCreate,
    delete: fakerUserDelete,
    attach: fakerUserAttach,
    detach: fakerUserDetach,
  },
  deployment: {
    create: fakerDeploymentCreate,
    delete: fakerDeploymentDelete,
    attach: fakerDeploymentAttach,
    detach: fakerDeploymentDetach,
  }
}