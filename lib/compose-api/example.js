var compose = require('./index')({
  account: process.argv[2],
  deployment: process.argv[3],
  token: process.argv[4]
});

// compose.accounts()
//   .end(function(res){
//     console.log(res.status)
//     console.log(res.body)
//   })

// compose.deployments()
//   .end(function(res){
//     console.log(res.status)
//     console.log(res.body)
//   })

// compose.deployment()
//   .end(function(res){
//     console.log(res.status)
//     console.log(res.body)
//   })

// compose.deploymentVersion()
//   .end(function(res){
//     console.log(res.status)
//     console.log(res.body)
//   })

// compose.deploymentDatabases()
//   .end(function(res){
//     console.log(res.status)
//     console.log(res.body)
//   })

// compose.deploymentDatabase({ database: 'sobeit' })
//   .end(function(res){
//     console.log(res.status)
//     console.log(res.body)
//   })

// compose.deploymentUsers({ database: 'sobeit' })
//   .end(function(res){
//     console.log(res.status)
//     console.log(res.body)
//   })

// compose.deploymentUserCreate({ username: 'test3', password: 'supersecret', readOnly: false, database: 'sobeit3' })
//   .end(function(res){
//     console.log(res.status)
//     console.log(res.body)
//   })

// compose.deploymentUserDelete({ username: 'test', database: 'sobeit' })
//   .end(function(res){
//     console.log(res.status)
//     console.log(res.body)
//   })
