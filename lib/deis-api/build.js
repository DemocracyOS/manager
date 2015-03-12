var mkdir = require('mkdirp');
var rm = require('rimraf');
var Git = require('git-wrapper');
var path = require('path');
var fs = require('fs');
var log = require('lib/debug')('manager:deis-api:build');

function dockerfile(image){
  return [
    'FROM ' + image,
    'MAINTAINER Guido Vilariño <guido@democracyos.com>',
    'EXPOSE 80',
    'CMD node ./bin/dos-config && node index.js',
  ].join('\n');
}

var baseDir = '.tmp/deis-builds';

module.exports = function(data, fn){
  var folder = path.resolve('.', baseDir, data.app);
  var remote = 'ssh://git@' + data.controller + ':2222/' + data.app + '.git';

  log('Building Deis app \'%s\'.', data.app);

  mkdir(folder, function (err) {
    if (err) return log('Found error: ', err), fn(err || 'Error.');
    log('Created directory of repo for \'%s\'.', data.app);

    var git = new Git({
      'C': folder
    });

    git.exec('init', function(err){
      if (err) return log('Found error: ', err), fn(err || 'Error.');
      log('Inited deis repo for \'%s\'.', data.app);

      fs.writeFile(path.join(folder, 'Dockerfile'), dockerfile(data.image), function(err){
        if (err) return log('Found error: ', err), fn(err || 'Error.');
        log('Dockerfile created for \'%s\'.', data.app);

        git.exec('remote', ['add', 'deis', remote], function(err){
          if (err) return log('Found error: ', err), fn(err || 'Error.');
          log('Git remote added on \'%s\'.', data.app);

          git.exec('add', { all: true }, [], function(err){
            if (err) return log('Found error: ', err), fn(err || 'Error.');
            log('Git add --all on \'%s\'.', data.app);

            git.exec('commit', { a: true, m: true }, ['"Democratization time!"'], function(err){
              if (err) return log('Found error: ', err), fn(err || 'Error.');
              log('Files commited for \'%s\'.', data.app);

              git.exec('push', { force: true }, ['deis', 'master'], function(err){
                if (err) return log('Found error: ', err), fn(err || 'Error.');
                log('Repo pushed \'%s\'.', data.app);

                rm(folder, function(err){
                  if (err) return log('Found error: ', err), fn(err || 'Error.');
                  log('Directory deleted \'%s\'.', folder);
                  fn(null);
                })
              })
            })
          })
        })
      })
    })
  })
}
