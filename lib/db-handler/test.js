var request = require('superagent');
var mongodb = require('mongodb');

request
  .post('https://api.compose.io/deployments/democracyos/democracyos-mongodb/mongodb/api-test/users')
  .send({
    username: 'test',
    password: 'test',
    readOnly: false
  })
  .set('Accept-Version', '2014-06')
  .type('application/json')
  .set('Authorization', 'Bearer 19decef1930c00463bb000066e932909a89bb2bc1bf5440c40ef1e6d6df61bb48a6637c70e60ed0e20aa7594271f03210b5fba7ec8b31c629eb8cca73b19ff02')
  .end(function(res){
    console.log('-------create user-------')
    console.log(res.status)
    console.log(res.body)
    console.log('-------------------------')
  })

mongodb.MongoClient.connect('mongodb://test-admin:test@c787.candidate.20.mongolayer.com:10787,c832.candidate.18.mongolayer.com:10832/api-test?replicaSet=set-54f982323ce0a1aa15000400', function(err, db){
  console.log('-------drop db-------')
  if (err) return console.log(err);
  console.log('Connected')
  db.dropDatabase(function(err){
    if (err) return db.close(), console.log(err);
    console.log('dropped')
    db.close(function(err){
      if (err) return console.log(err);
      console.log('closed.')
      console.log('---------------------')
    });
  });
});