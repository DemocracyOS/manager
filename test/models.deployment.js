var expect = require('chai').expect;
var clearDb = require('./support/clear-db');
var Faker = require('test/support/faker');
var Deployment = require('lib/models').Deployment;

var faker = new Faker('models-deployment');

describe('Models Deployment', function(){
  after(clearDb);

  describe('.nameIsValid()', function(){
    [
      'name',
      'name-with-slash',
      'a',
      'abc'
    ].forEach(function(name){
      it('"'+name+'" should be valid', function(){
        var isValid = Deployment.nameIsValid(name);
        expect(isValid).to.be.true;
      });
    });

    [
      '-asd',
      'asd-',
      'coneñe',
      'name!',
      'asdqwertvxasdqwertvxasdqwertvxasdqwertvxasdqwertvxasdqwertvxasdqwertvxasdqwertvxq',
    ].forEach(function(name){
      it('"'+name+'" should be invalid', function(){
        var isValid = Deployment.nameIsValid(name);
        expect(isValid).to.be.false;
      });
    });
  });

  describe('#setStatus()', function(){
    before(faker.create('user', 'setStatus'));

    before(function(done){
      var user = faker.get('user', 'setStatus');
      faker.create('deployment', 'setStatus', {
        owner: user
      })(done);
    });

    it('should change status from "creating" to "ready"', function(done){
      var self = this;
      var deployment = faker.get('deployment', 'setStatus');

      deployment.setStatus('ready', function(err){
        if (err) throw err;
        if (deployment.status !== 'ready') {
          return done(new Error('Deployment status didnt change.'));
        }
        done(null);
      });
    });
  });
});
