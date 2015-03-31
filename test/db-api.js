var mongoose = require('mongoose');
var clearDb = require('./support/clear-db');
var Deployment = require('lib/models').Deployment;
var api = require('lib/db-api');
var Faker = require('test/support/faker');

describe('Db Api User', function(){
  var faker = new Faker('db-api-user');

  describe('#exists()', function(){
    before(faker.create('user', 'exists'));

    it('should return "true" when user exists', function(done){
      var user = faker.get('user', 'exists');
      api.user.exists(user._id, function(err, exists){
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

describe('Db Api Deployment', function(){
  var faker = new Faker('db-api-deployment');

  before(faker.create('user', 'index'));

  before(function(done){
    var user = faker.get('user', 'index');
    faker.create('deployment', 'index', {
      owner: user
    })(done);
  });

  after(clearDb);

  describe('#get()', function(){
    it('should find existent deployment', function(done){
      var deployment = faker.get('deployment', 'index');
      api.deployment.get(deployment.name, done)
    });
  });

  describe('#exists()', function(){
    it('should return "true" when deployment exists', function(done){
      var deployment = faker.get('deployment', 'index');
      api.deployment.exists({ name: deployment.name }, function(err, exists){
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
    before(faker.create('user', 'create'));

    it('should create deployment', function(done){
      var user = faker.get('user', 'create');

      api.deployment.create({
        name: 'test-democracy-on-create',
        title: 'Test Democracy on Create',
        owner: user._id,
        status: 'creating'
      }, done);
    });
  });

  describe('#remove()', function(){
    it('should delete deployment', function(done){
      var deployment = faker.get('deployment', 'index');
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
