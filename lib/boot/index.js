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
  app.use(app.router);
});

// function checkAccessToken(req, res, next) {
//   var accessToken = req.query.access_token;

//   if (!accessToken) {
//     return res.send(401, {message: 'access_token is missing'});
//   }

//   if (accessToken !== config.accessToken) {
//     return res.send(401, {message: 'access_token is wrong'});
//   }

//   next();
// }

app.get('/', function (req, res) {
  res.json({
    app: 'manager',
    env: process.env.NODE_ENV,
    port: config.port,
    version: package.version,
    apiUrl: '/'
  });
});