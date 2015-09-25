'use strict';

module.exports = function(grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      all: {
        files: {
          'public/css/main.css': 'public/css/less/main.less'
        }
      }
    },
    sass: {
      production: {
        options: {
          style: 'compressed',
        },
        files: {
          'public/css/main.css' : 'public/css/sass/main.scss'
        }
      },
      test: {
        options: {
          style: 'compressed',
          sourcemap: 'none'
        },
        files: {
          'public/css/main.css' : 'public/css/sass/main.scss'
        }
      }
    },
    watch: {
      css: {
        files: ['public/css/sass/**'],
        tasks: ['sass:test']
      }
    }
  });

  //Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');

  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  //Default task(s).
  grunt.registerTask('default', ['sass']);
};