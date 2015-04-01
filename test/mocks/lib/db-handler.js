exports.create = function (name, fn) {
  fn(null, 'mongodb://fakeuser:fakepassword@fakemongohost.dev:27017/fakedb');
}

exports.drop = function (name, fn) {
  fn(null);
}
