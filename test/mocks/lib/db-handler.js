exports.create = function (name, fn) {
  fn(null, 'mongodb://fakeuser:fakepassword@fakemongohost/fakedb');
}

exports.drop = function (name, fn) {
  fn(null);
}
