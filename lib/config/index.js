/**
 * Extend module's NODE_PATH
 * HACK: temporary solution
 */

require('node-path')(module);

/**
 * Module dependencies.
 */

var log = require('lib/debug')('manager:config');
var environment = process.env.NODE_ENV || 'development';
var resolve = require('path').resolve;
var merge = require('merge-util');
var has = Object.prototype.hasOwnProperty;
var envConf = require('./env');

var filepath = resolve(__dirname, '..', '..', 'config', environment + '.json');

var localConf = {};

try {
  log('Load local configuration from %s', filepath);
  localConf = require(filepath);
} catch (e) {
  log('Unalbe to read configuration from file %s: %s', filepath, e.message);
}

log('Merge environment set configuration variables');

var conf = merge(localConf, envConf, { discardEmpty: false });
conf.env = environment;

log('Loaded config object for env %s');

module.exports = config;

function config(key) {
  if (has.call(conf, key)) return conf[key];
  log('Invalid config key [%s]', key);
  return undefined;
}

for (var key in conf) config[key] = conf[key];