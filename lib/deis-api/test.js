var crypto = require('crypto');
var DeisAPI = require('deis-api');
var deis = new DeisAPI({
  controller: 'deis.democracyos.com',
  username: 'mjlescano',
  password: 'pirulo'
});

deis.login(function(err){
  if(err) return console.log('ERROR', err);
  console.log('Logged in')

  deis.apps.create('test-deis', function(err, app) {
    if(err) return console.log('ERROR', err);

    console.log('Deis app created: ');
    console.log(app);

    var _config = {
      COMMENTS_PER_PAGE: 25,
      LEARN_MORE_URL: 'http://democracyos.org',
      ORGANIZATION_URL: 'http://democracyos.org',
      LOCALE: 'en',
      MULTICORE: 'false',
      FAVICON: 'http://democracyos-demo.s3.amazonaws.com/logo.png',
      PORT: '80',
      PUBLIC_PORT: '80',
      NODE_ENV: 'production',
      PROTOCOL: 'http',
      SPAM_LIMIT: '5',
      RSS_ENABLED: 'true',
      DEBUG: 'democracyos*',
      LOGO: 'http://democracyos-demo.s3.amazonaws.com/logo.png',
      NOTIFICATIONS_TOKEN: 'ff928bfcdab8b0dc7ebe1d0c143ba126',
      NOTIFICATIONS_URL: 'http://deis-notifier.herokuapp.com:80/api/events',
      NODE_PATH: '.',

      ORGANIZATION_NAME: 'Deis Test',
      HOST: 'test-deis.democracyos.com',
      JWT_SECRET: crypto.randomBytes(20).toString('base64'),
      STAFF: ['matiasj.lescano@gmail.com'],
      MONGO_URL: 'mongodb://test:test@c787.candidate.20.mongolayer.com:10787,c832.candidate.18.mongolayer.com:10832/test-deis?replicaSet=set-54f982323ce0a1aa15000400'
    };

    deis.config.set('test-deis', _config, function(err, values) {
      if (err) {
        return console.log('Error configurating', err);
      }

      console.log('Deis app configured: ', values);

      // deis.builds.create('test-deis', 'democracyos/app:0.11.3-deis', function(err, app) {
      //   if (err) {
      //     return console.log('Error deploying', err);
      //   }
      //   console.log('Deis app deployed: ', app);
      // });
    });
  });
});