/**
* Expose models's database api
*/

[
  'instance'
].forEach(function(model){
  exports[model] = require('./'+model);
});
