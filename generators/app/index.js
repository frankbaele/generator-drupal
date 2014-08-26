'use strict';
var util = require('util');
var path = require('path');
var tar = require('tar');
var request = require('request');
var fs = require("fs");
var http = require("http");
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
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

    done();
  },

  getDrupal: function (drupalVersion) {
    var file = fs.createWriteStream("download/drupal.tar.gz");
    var request = http.get("http://ftp.drupal.org/files/projects/drupal-7.31.tar.gz", function(response) {

      response
        .pipe(file)
        .on('end', function() {
         tar.Extract({ path: "extract" });
      });
    });
  }
});

module.exports = DrupalGenerator;



