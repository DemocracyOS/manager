/**
* Expose models's database api
*/

[
  'instance',
  'user'
].forEach(function(model){
  exports[model] = require('./'+model);
});
