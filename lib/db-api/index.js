/**
* Expose models's database api
*/

[
  'deployment',
  'user'
].forEach(function(model){
  exports[model] = require('./'+model);
});
