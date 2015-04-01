exports.untilIsUp = function(deployment, fn) {
  fn(null);
}

exports.isUp = function(deployment, fn) {
  fn(null, true);
}
