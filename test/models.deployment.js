var expect = require('chai').expect;
var clearDb = require('./support/clear-db');
var User = require('lib/models').User;
var Deployment = require('lib/models').Deployment;

describe('Deployment', function(){
  before(function(done){
    this.user = new User({
      email: 'afake-name@fakedomain.com.foo'
    });

    this.user.save(done);
  });

  before(function(done){
    this.deployment = new Deployment({
      name: 'test-democracy',
      title: 'Test Democracy',
      owner: this.user._id,
      status: 'creating'
    });

    this.deployment.save(done);
  });

  after(clearDb);

  it('should not be created with duplicated name', function(done){
    var deployment = new Deployment({
      name: 'test-democracy',
      title: 'Test Democracy',
      owner: this.user,
      status: 'creating'
    });

    deployment.save(function(err){
      if (err && err.name === 'ValidationError') return done(null);
      if (err) return done(err);
      done(new Error('Model with duplicated name saved.'));
    });
  });

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
    it('should change status from "creating" to "ready"', function(done){
      var self = this;

      this.deployment.setStatus('ready', function(err){
        if (err) throw err;

        if (self.deployment.status !== 'ready') {
          return done(new Error('Deployment status didnt change.'));
        }

        done(null);
      });
    });
  });
});
