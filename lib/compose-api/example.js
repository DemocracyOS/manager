var compose = require('./index')({
  token: 'cae8e382ffcfadde12cbd5b1c58f6bd19a2091322b1c6d05dfdc5f11d128475bb19a3e4a4ba8b49eb982f59c5d2202ef5e7568219324c06928c7063e7e6805dc',
  account: 'democracyos',
  deployment: 'democracyos-mongodb'
});

// compose.accounts()
//   .end(function(res){
//     console.log(res.body)
//   })

// compose.deployments()
//   .end(function(res){
//     console.log(res.body)
//   })

// compose.deployment()
//   .end(function(res){
//     console.log(res.body)
//   })

// compose.deploymentDbVersion()
//   .end(function(res){
//     console.log(res.body)
//   })

compose.deploymentDbVersion()
  .end(function(res){
    console.log(res.body)
  })
