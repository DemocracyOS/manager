/**
 * Module dependencies.
 */

var package = require('package.json');
var express = require('express');
var app = module.exports = express();
var config = require('lib/config');

/**
 * Link models with
 * mongoDB database
 */

require('lib/models')(app);

var cors = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Access-Token, X-Revision, Content-Type');

  next();
};

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(cors);
app.use(express.methodOverride());
app.use(validateToken);
app.use(app.router);

function validateToken(req, res, next) {
  var token = req.query.access_token || (req.body && req.body.access_token);

  if (!token) return res.send(401, { msg: 'access_token missing.' });

  if (token !== config('accessToken')) {
    return res.send(401, { msg: 'access_token is wrong.' });
  }

  next();
}

/*
 * Local signin routes
 */

app.use('/instances', require('lib/instance-api'));

app.get('/', function (req, res) {
  res.json({
    app: 'manager',
    env: process.env.NODE_ENV,
    port: config.port,
    version: package.version,
    apiUrl: '/'
  });
});