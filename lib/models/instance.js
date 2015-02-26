/**
* Module dependencies.
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var ObjectId = Schema.ObjectId;

/*
 * Instance Schema
 */

var InstanceSchema = new Schema({
  title:     { type: String, required: true },
  summary:   { type: String, required: true },
  url:       { type: String, required: true },
  imageUrl:  { type: String },
  // REMOVED: we're not sure yet how the users DB is going to be handled.
  // owner:     { type: ObjectId, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date }
});

// InstanceSchema.index({ user: -1 });

module.exports = mongoose.model('Instance', InstanceSchema);
