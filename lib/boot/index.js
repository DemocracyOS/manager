/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express();
var package = require('../../package.json');
var config = require('../config');

var cors = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Access-Token, X-Revision, Content-Type');

  next();
};

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(cors);
  app.use(express.methodOverride());
  app.use(validateApiKey);
  app.use(app.router);
});

function validateApiKey(req, res, next) {
  var apiKey = req.query.api_key;

  if (!apiKey) {
    return res.send(403, { message: 'api_key missing.' });
  }

  if (apiKey !== config['api key']) {
    return res.send(403, { message: 'api_key is wrong.' });
  }

  next();
}

app.get('/', function (req, res) {
  res.json({
    app: 'manager',
    env: process.env.NODE_ENV,
    port: config.port,
    version: package.version,
    apiUrl: '/'
  });
});