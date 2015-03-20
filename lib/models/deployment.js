/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var mongooseUniqueValidator = require('mongoose-unique-validator');
var softDelete = require('mongoose-delete');
var config = require('lib/config');

/**
 * Deployment Statuses
 */

var statuses = [
  'creating',
  'destroying',
  'error',
  'ready',
  'destroyed',
];

/*
 * Deployment Schema
 */

var DeploymentSchema = new Schema({
  name: {
    type: String,
    index: true,
    required: true,
    unique: true,
    trim: true,
    lowecase: true,
    // String, between 1~80 chars, alphanumeric or `-`, not starting nor finishing with `-`.
    match: /^([a-zA-Z0-9]{1,2}|[a-zA-Z0-9][a-zA-Z0-9\-]{1,78}[a-zA-Z0-9])$/
  },
  deisId:    { type: String },
  url:       { type: String },
  title:     { type: String, required: true, trim: true },
  summary:   { type: String, trim: true },
  imageUrl:  { type: String },
  mongoUrl:  { type: String },
  owner:     { type: ObjectId, required: true, unique: true, ref: 'User' },
  status:    { type: String, required: true, enum: statuses },
  createdAt: { type: Date, default: Date.now }
});

DeploymentSchema.index({ owner: -1 });
DeploymentSchema.index({ name: -1 });

DeploymentSchema.plugin(mongooseUniqueValidator);
DeploymentSchema.plugin(softDelete, { deletedAt: true });

DeploymentSchema.path('name').validate(function(val){
  return !/^deis/i.test(val);
}, 'Name already taken.');

DeploymentSchema.path('name').validate(function(val){
  return !~config('deploymentReservedNames').indexOf(val);
}, 'Name already taken.');

DeploymentSchema.pre('remove', function(next) {
  mongoose.model('Feed').remove({ deploymentId: this._id }).exec();
  next();
});

DeploymentSchema.statics.nameIsValid = function (name) {
  return name && /^([a-z0-9]{1,2}|[a-z0-9][a-z0-9\-]{1,78}[a-z0-9])$/.test(name);
}

DeploymentSchema.methods.setStatus = function (status, fn){
  this.status = status;
  this.save(fn);
  return this;
}

DeploymentSchema.methods.hasDeisDeployment = function (){
  return !!this.deisId;
}

DeploymentSchema.methods.setDeisDeployment = function (app){
  this.deisId = app.uuid;
  this.url = app.url;
  return this;
}

DeploymentSchema.methods.unsetDeisDeployment = function (){
  this.deisId = undefined;
  this.url = undefined;
  return this;
}

DeploymentSchema.methods.canAssignDeisDeployment = function (){
  if (this.hasDeisDeployment()) return false;
  return true;
}

module.exports = function initialize(conn) {
  return conn.model('Deployment', DeploymentSchema);
}
