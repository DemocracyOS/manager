var log = require('debug')('manager:deployment-handler:fetch-status');
var request = require('superagent');
var urljoin = require('url-join');

exports.untilIsUp = function(deployment, fn) {
  var retries = 20;
  var timeout = 5000;

  function get(err, isUp) {
    if (err) return log('Error requesting for GET: %s/api', deployment.url), fn(err);

    if (isUp) {
      log('Deployment "%s" is ready to access on %s', deployment.name, deployment.url);
      fn(null);
    } else {
      if (--retries !== 0) {
        log('Deployment %s is still not available, retrying in ' + (timeout / 1000) + ' seconds.', deployment.url);
        return setTimeout(function(){
          exports.isUp(deployment, get);
        }, timeout);
      } else {
        log('Deployment %s is still not available after %s retries, giving up', deployment.url, retries);
        fn(new Error('The deployment "' + deployment.name + '" is not up after retrying ' + retries + ' times.'))
      }
    }
  }

  setTimeout(function(){
    exports.isUp(deployment, get);
  }, timeout);
}

exports.isUp = function(deployment, fn) {
  request
    .get(urljoin(deployment.url, 'api'))
    .accept('application/json')
    .end(function (err, res) {
      log('Deployment responded with %s', res.status);

      if (res.status == 200 || res.status == 403) {
        return fn(null, true);
      }

      fn(null, false);
    });
}