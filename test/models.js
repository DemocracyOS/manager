var expect = require('chai').expect;
var models = require('lib/models');

describe('Models', function(){
  it('should export Deployment', function(){
    expect(models.Deployment).to.exist;
  });

  it('should export Feed', function(){
    expect(models.Feed).to.exist;
  });

  it('should export User', function(){
    expect(models.User).to.exist;
  });
});
