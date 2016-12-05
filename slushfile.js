/*
 * slush-simple-gulp
 * https://github.com/matheus-neves/slush-performance
 *
 * Copyright (c) 2016, Matheus Neves
 * Licensed under the MIT license.
 */
'use strict';
var gulp     = require('gulp'),
    install  = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename   = require('gulp-rename'),
    _        = require('underscore.string'),
    inquirer = require('inquirer');

gulp.task('default', function(done) {
  //Answers
  var prompts = [{
      name: 'appName',
      message: 'What the Name of Project?'
  }, {
      name: 'appDescription',
      message: 'What the Description?'
  }, {
      name: 'appVersion',
      message: 'What the Version?',
      default: '0.1.0'
  }, {
      name: 'appAuthor',
      message: 'Name of Author?'
  }, {
      name: 'appEmail',
      message: 'Author E-mail?'
  }, {
  	  type: 'list',
  	  name: 'template',
  	  message: 'Choose your Favorite Template',
  	  choices: [
        { name: 'stylus', value: 'stylus'}
  	  ],
        default: 1
  }, {
  	  type: 'confirm',
  	  name: 'go',
  	  message: 'Go?'
  }];

  //Ask
  inquirer.prompt(prompts,
    function(answers) {
        if (!answers.go) {
            return done();
        }
        answers.appNameSlug = _.slugify(answers.appName);
        gulp.src(__dirname + '/templates/' + answers.template + '/**')
            .pipe(template(answers))
            .pipe(rename(function(file) {
              if (file.basename[0] === '_') {
                  file.basename = '.' + file.basename.slice(1);
              }
            }))
            .pipe(rename(function(file) {
              if (file.basename[0] === '-') {
                  file.basename = '_' + file.basename.slice(1);
              }
            }))
            .pipe(conflict('./'))
            .pipe(gulp.dest('./'))
            .pipe(install())
            .on('end', function() {
                done();
            });
    });
});