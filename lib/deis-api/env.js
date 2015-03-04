var env = require('lib/config')('instance env');
var merge = require('mout/object/merge');

module.exports = function(_env){
  return merge(env, _env);
}
