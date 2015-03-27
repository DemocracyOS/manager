var config = require('lib/config');
var clearDB = require('mocha-mongoose')(config('mongoUrl'), { noClear: true });

module.exports = clearDB;