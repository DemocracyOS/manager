var env = require('lib/config')('deis instance env');
var merge = require('mout/object/merge');

module.exports = function(_env){
  return merge(env, _env);
}
