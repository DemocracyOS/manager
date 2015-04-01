var clearDb = require('test/support/clear-db');
var Faker = require('test/support/faker');
var mocks = require('test/mocks');
var api = require('lib/db-api');

var faker = new Faker('deployment-handler');

describe('Deployment Handler', function(){

  var deploymentHandler = null;

  [
    'lib/db-handler',
    'lib/deis-api',
    'lib/deployment-handler/fetch-status'
  ].forEach(function(name){
    before(mocks.enable(name));
    after(mocks.disable(name));
  });

  before(function(){
    deploymentHandler = require('lib/deployment-handler');
  });

  after(clearDb);

  describe('.create()', function(){
    var deployment = null;

    before(faker.create('user', 'create'));

    it('should create a Deployment with status "creating"', function(done){
      var user = faker.get('user', 'create');
      var data = {
        name: 'deployment-handler-create',
        title: 'DeploymentHandler Create()',
        owner: user._id.toString()
      };

      deploymentHandler.create(data, function(err, _deployment) {
        if (err) return done(err);
        deployment = _deployment;

        if (deployment.status !== 'creating') {
          return done(new Error('Deployment status is not "creating"'));
        }

        done(null);
      });
    });

    it('should set the Deployment with status "ready" after some time', function(done){
      function check(){
        if (deployment.status === 'creating') {
          setTimeout(check, 10);
        } else if (deployment.status === 'ready') {
          done(null);
        } else {
          done(new Error('Deployment status is not "ready"'));
        }
      }

      check();
    });
  });

  describe('.destroy()', function(){
    var deployment = null;

    before(faker.create('user', 'destroy'));

    before(function(done){
      var user = faker.get('user', 'destroy');
      faker.create('deployment-ready', 'destroy', {
        owner: user
      })(done);
    });

    it('should set the Deployment with status "destroying"', function(done){
      var deployment = faker.get('deployment-ready', 'destroy');
      deploymentHandler.destroy(deployment, function(err){
        if (err) return done(err);
        if (deployment.status !== 'destroying') {
          return done(new Error('Deployment status is not "destroying"'));
        }
        done(null);
      });
    });

    it('should delete the Deployment from the database after some time', function(done){
      var deployment = faker.get('deployment-ready', 'destroy');

      function check(){
        api.deployment.exists({ name: deployment.name }, function(err, exists){
          if (err) throw err;

          if (!exists) {
            deployment = undefined;
            return done(null);
          }

          if (deployment.status === 'destroying') {
            setTimeout(check, 10);
          } else {
            console.log('=======================');
            console.log(deployment);
            console.log('=======================');
            done(new Error('Deployment status is not "destroying"'));
          }
        });
      }

      setTimeout(check, 10);
    });
  });

  describe('.validateData()', function(){
    before(faker.create('user', 'validateData'));

    before(function(done){
      var user = faker.get('user', 'validateData');
      faker.create('deployment', 'validateData', {
        owner: user
      })(done);
    });

    it('should fail if the owner already has a deployment', function(done){
      var user = faker.get('user', 'validateData');

      var data = {
        name: 'test-deployment-handler-validatedata',
        title: 'Test DeploymentHandler validateData()',
        owner: user._id.toString()
      };

      deploymentHandler.validateData(data, function(err) {
        if (err && err.message === 'Owner already has a deployment.') {
          return done(null);
        }
        return done(new Error('Validation shouldnt pass.'));
      });
    });
  });
});
