/**
* Module dependencies.
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var mongooseUniqueValidator = require('mongoose-unique-validator');

/*
 * Instance Schema
 */

var InstanceSchema = new Schema({
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
  deis_uuid: { type: String },
  url:       { type: String },
  title:     { type: String, required: true, trim: true },
  summary:   { type: String, trim: true },
  imageUrl:  { type: String },
  mongo_url: { type: String },
  owner:     { type: ObjectId, required: true, unique: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date }
});

InstanceSchema.index({ owner: -1 });
InstanceSchema.index({ name: -1 });

InstanceSchema.plugin(mongooseUniqueValidator);

InstanceSchema.statics.nameIsValid = function (name) {
  return name && /^([a-z0-9]{1,2}|[a-z0-9][a-z0-9\-]{1,78}[a-z0-9])$/.test(name);
}

InstanceSchema.methods.hasDeisInstance = function (){
  return !!this.deis_uuid;
}

InstanceSchema.methods.setDeisInstance = function (app){
  this.deis_uuid = app.uuid;
  this.url = app.url;
  return this;
}

InstanceSchema.methods.unsetDeisInstance = function (){
  this.deis_uuid = undefined;
  this.url = undefined;
  return this;
}

InstanceSchema.methods.canAssignDeisInstance = function (){
  if (this.isNew || this.isModified()) return false;
  if (this.hasDeisInstance()) return false;
  return true;
}

module.exports = mongoose.model('Instance', InstanceSchema);
