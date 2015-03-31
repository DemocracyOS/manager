var mockery = require('mockery');

var mocked = 0;

module.exports = {
  enable: function(name, mock){
    if (!name) return;
    if (!mock) mock = './' + name;
    return function(){
      if (++mocked === 1) {
        mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
      }
      mockery.registerMock(name, require(mock));
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
