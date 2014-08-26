var path = require('path'),
  fs = require('fs'),
  yeoman = require('yeoman-generator'),
  yosay = require('yosay'),
  chalk = require('chalk'),

  _ = require('underscore'),

  request = require('request'),
  q = require('q'),
  zlib = require('zlib'),
  tar = require('tar'),
  mkdirp = require('mkdirp'),
  xml2js = require('xml2js');

var getDrupal = function (version) {
  var download = q.defer();

  process.stdout.write('Downloading Drupal '+version+'. Please wait...');
  request('https://github.com/drupal/drupal/archive/7.x.tar.gz', function (error, response, body) {
    if (!error && response.statusCode == 200) {

      process.stdout.write("\r");
      process.stdout.write('Extracting Drupal '+version+'. Please wait... ');

      fs.createReadStream('drupal-7.x.tar.gz')
        .on('error', function(e) {
          download.reject();
          throw new Error(e);
        })
        .pipe(zlib.Unzip())
        .pipe(tar.Parse())
        .on('entry', function(entry) {

          var pathToFile = entry.path.replace('drupal-7.x/', '');

          if(pathToFile == '') return;

          mkdirp(path.dirname(pathToFile), function(err) {
            if (err) throw err;

            if(fs.existsSync(pathToFile)) {
              var statSync = fs.statSync(pathToFile);
              if(statSync.isDirectory()) {
                return;
              }
            }

            if(pathToFile.substr(-1, 1) == '/') {
              return;
            }

            entry
              .pipe(fs.createWriteStream(pathToFile))
              .on('error', function(err) {
                if(err.errno != 28) {
                  process.stdout.write("\r");
                  console.log(chalk.red('   error') + ' Drupal '+version+'                       ');
                  console.log('');

                  throw err;
                }
              });
          });

        })
        .on('end', function() {
          process.stdout.write("\r");
          console.log(chalk.green('   downloaded') + ' Drupal '+version+'                       ');
          console.log('');

          fs.unlink('drupal-7.x.tar.gz');

          download.resolve();
        });

    } else {
      download.reject();
    }

  }).pipe(fs.createWriteStream('drupal-7.x.tar.gz'));

  return download.promise;
}
var DrupalGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.getDrupal(this.drupalVersion);
      }
    });
  },

  askFor: function () {
    var done = this.async();

    this.log(this.yeoman);
    this.log(chalk.magenta('You\'re using the Drupal generator'));
    var prompts = [{
      type: 'input',
      name: 'projectName',
      message: 'Name this project'
    }];
    this.prompt(prompts, function (props) {
      this.drupalVersion = '7';
      this.projectName = props.projectName;
      done();
    }.bind(this));
  },

  getDrupal: function() {
    var done = this.async();

    if(this.options['skip-drupal']) {
      return done();
    }

    getDrupal(this.drupalVersion).then(function() {
      done();
    }, function() {
      throw new Error('FAILED');
    });
  }


});

module.exports = DrupalGenerator;



