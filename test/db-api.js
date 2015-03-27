var mongoose = require('mongoose');
var clearDb = require('./support/clear-db');
var faker = require('./support/faker');
var Deployment = require('lib/models').Deployment;
var api = require('lib/db-api');

describe('User Api', function(){
  before(faker.user.attach);
  after(clearDb);

  describe('#exists()', function(){
    it('should return "true" when user exists', function(done){
      api.user.exists(this.user._id, function(err, exists){
        if (err) throw err;
        if (!exists) return done(new Error('User not found'));
        done(null);
      });
    });

    it('should return "false" when user dont exists', function(done){
      api.user.exists(mongoose.Types.ObjectId(), function(err, exists){
        if (err) throw err;
        if (exists) return done(new Error('User found (?)'));
        done(null);
      });
    });
  });
});

describe('Deployment Api', function(){
  before(faker.deployment.attach);
  after(clearDb);

  describe('#get()', function(){
    it('should find existent deployment', function(done){
      api.deployment.get(this.deployment.name, done)
    });
  });

  describe('#exists()', function(){
    it('should return "true" when deployment exists', function(done){
      api.deployment.exists({ name: this.deployment.name }, function(err, exists){
        if (err) throw err;
        if (!exists) return done(new Error('Deployment not found'));
        done(null);
      });
    });

    it('should return "false" when deployment dont exists', function(done){
      api.deployment.exists({ name: 'non-existent-deployment' }, function(err, exists){
        if (err) throw err;
        if (exists) return done(new Error('Deployment found (?)'));
        done(null);
      });
    });
  });

  describe('#create()', function(){
    it('should create deployment', function(done){
      faker.user.create(function(err, user){
        api.deployment.create({
          name: 'test-democracy-on-create',
          title: 'Test Democracy on Create',
          owner: user._id,
          status: 'creating'
        }, done);
      });
    });
  });

  describe('#remove()', function(){
    it('should delete deployment', function(done){
      faker.user.create(function(err, user){
        if (err) throw err;
        faker.deployment.create(user, function(err, deployment){
          if (err) throw err;
          api.deployment.remove(deployment, function(err){
            if (err) throw err;
            Deployment.find({ _id: deployment._id }).limit(1).exec(function(err, deployments){
              if (err) throw err;
              if (deployments.length > 0) return done(new Error('Deployment not deleted'));
              done(null);
            });
          });
        });
      });
    });
  });
});
