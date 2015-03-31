module.exports = Faker;

var allowedModels = [
  'user',
  'deployment',
  'deployment-ready'
];

function Faker(scope) {
  if (!(this instanceof Faker)) return new Faker(scope);
  var self = this;

  this.models = {};
  this.scope = (scope && scope + '-') || '';

  allowedModels.forEach(function(model){
    self.models[model] = {};
  })
}

Faker.prototype.create = function create(model, identifier, options){
  var self = this;
  var Model = require('./' + model);

  if (this.models[model][identifier]) {
    throw new Error('Trying to fake two models with same identifier.');
  }

  var instance = Model.create(this.scope + identifier, options);
  this.models[model][identifier] = instance;

  return function(fn){
    Model.save(instance, function(err){
      if (err) throw err;
      if (fn) fn(null);
    });
  }
}

Faker.prototype.destroy = function destroy(model, identifier){
  var self = this;
  var Model = require('./' + model);
  var instance = this.models[model][identifier];

  if (!instance) throw new Error('Trying to destroy unexistent faked model.');

  return function(fn){
    Model.destroy(instance, function(err){
      if (err) throw err;
      this.models[model][identifier] = undefined;
      if (fn) fn(null);
    });
  }
}

Faker.prototype.get = function get(model, identifier){
  return this.models[model][identifier];
}
