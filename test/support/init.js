/**
 * Extend module's NODE_PATH
 * HACK: temporary solution
 */

require('node-path')(module);

/**
 * Mock mongodb
 */

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');

mockgoose(mongoose);
