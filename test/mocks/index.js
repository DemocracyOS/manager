var mockery = require('mockery');

var mocked = 0;

module.exports = {
  enable: function(name){
    return function(){
      if (!name) return;
      if (++mocked === 1) mockery.enable({ warnOnUnregistered: false });
      mockery.registerMock(name, require('./'+name));
    }
  },

  disable: function(name){
    return function(){
      if (!name) return;
      mockery.deregisterMock(name);
      if (--mocked === 0) mockery.disable();
    }
  }
}
