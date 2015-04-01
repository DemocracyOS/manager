exports.create = function (name, fn) {
  var app = {
    created: '2014-01-01T00:00:00UTC',
    id: name,
    owner: 'test',
    structure: {},
    updated: '2014-01-01T00:00:00UTC',
    url: name+'.democracyos.dev',
    uuid: 'de1bf5b5-4a72-4f94-a10c-d2a3741cdf75'
  };

  fn(null, app);
}

exports.deploy = function (name, envs, fn) {
  fn(null);
}

exports.destroy = function (name, fn) {
  fn(null);
}