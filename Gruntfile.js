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
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [
            //Vendor non-angular javascript
            'public/js/vendor/*.js',
            'public/lib/lodash/dist/lodash.min.js',
            'public/lib/moment/min/moment.min.js',
            'public/lib/newrelic-timing/newrelic-timing.min.js',
            'public/lib/angular-route/angular-route.js',
            'public/lib/angular-ui-utils/modules/route/route.js',
            'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
            'public/lib/angular-ui-router/release/angular-ui-router.min.js',
            'public/lib/ng-file-upload/angular-file-upload-shim.min.js',
            'public//lib/jsondiffpatch/build/bundle-full.min.js',


            //core angular code
            'public/js/*.js',
            'public/js/services/*.js',
            'public/js/wizards/*.js',
            'public/js/models/*.js',
            'public/js/controllers/*.js',
            'public/js/directives/*.js',

            //templates and vies
            'public/js/_dist/templates.js',
            'public/js/_dist/views.js',

            //vendor directives
            'public/lib/textAngular/dist/textAngular-sanitize.min.js',
            'public/lib/angular-moment/angular-moment.min.js',
            'public/lib/angular-timer/dist/angular-timer.min.js',
            'public/lib/angular-ui-sortable/sortable.min.js',
            'public/lib/angular-ui-utils/modules/route/route.js',
            'public/lib/angular-loading-bar/build/loading-bar.min.js',
            'public/lib/newrelic-timing/newrelic-timing-angular.min.js',
            'public/lib/ng-file-upload/angular-file-upload.min.js',
            'public/lib/ngDialog/js/ngDialog.js',
            'public/lib/angular-ellipsis/src/angular-ellipsis.min.js',
            'public/lib/ngInfiniteScroll/build/ng-infinite-scroll.min.js',
            'public/lib/angular-payments/lib/angular-payments.min.js',
            'public/lib/rangeslider.js/dist/rangeslider.min.js',
            'public/lib/angular-inview/angular-inview.js',
            'public/lib/angular-scroll/angular-scroll.min.js',
            'public/lib/angular-ui-utils/modules/event/event.js',
            'public/lib/angular-ui-utils/modules/keypress/keypress.js',
            'public/lib/nsPopover/src/nsPopover.js',
          ],
        dest: 'public/js/_dist/vessel_app.js',
      },
    },
    ngmin: {
      angular: {
        src : ['public/js/_dist/vessel_app.js'],
        dest : 'public/js/_dist/vessel_app.js'
      }
    },
    uglify : {
      options: {
        report: 'min',
        mangle: false
      },
      my_target : {
        files : {
          'public/js/_dist/vessel_app.js' : ['public/js/_dist/vessel_app.js']
        }
      }
    },
    ngtemplates: {
      directives: {
        cwd: 'public',
        src:'templates/**.html',
        dest: 'public/js/_dist/templates.js',
        options: {
          module: 'vessel',
          htmlmin: {
            collapseBooleanAttributes:      true,
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeComments:                 true, // Only if you don't use comment directives!
            removeEmptyAttributes:          true,
            removeRedundantAttributes:      true,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true
          }
        }
      },
      views: {
        cwd: 'public',
        src:'views/**.html',
        dest: 'public/js/_dist/views.js',
        options: {
          module: 'vessel',
          htmlmin: {
            collapseBooleanAttributes:      true,
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeComments:                 true, // Only if you don't use comment directives!
            removeEmptyAttributes:          true,
            removeRedundantAttributes:      true,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true
          }
          // concat: 'public/js/_dist/vessel_app.js'
        }
      }
    },
    s3: {
      options: {
        key: 'AKIAJLO5XIIEQ22XE4OA',
        secret: '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',
        access: 'public-read'
      },
      production: {
        options: {
          bucket: 'vessel_static',
          gzip: 'true'
        },
        upload: [
          {
            src: 'public/js/_dist/vessel_app.js',
            dest: '/vessel_app.js'
          },
          {
            src: 'public/css/main.css',
            dest: '/vessel_style.css'
          }
        ]
      },
      staging: {
        options: {
          bucket: 'vessel_static',
          gzip: 'true'
        },
        upload: [
          {
            src: 'public/js/_dist/vessel_app.js',
            dest: '/vessel_app_staging.js'
          },
          {
            src: 'public/css/main.css',
            dest: '/vessel_style_staging.css'
          }
        ]
      },
      test: {
        options: {
          bucket: 'vessel_static',
          gzip: 'true'
        },
        upload: [
          {
            src: 'public/js/_dist/vessel_app.js',
            dest: '/vessel_app_test.js'
          },
          {

            src: 'public/css/main.css',
            dest: '/vessel_style_test.css'
          }
        ]
      }
    },
    watch: {
      css: {
        files: ['public/css/sass/**'],
        tasks: ['sass:test']
      }
    },
    mochaTest: {
      options: {
        quiet: false,
        clearRequireCache: false,
        timeout: 15000
      },
      api: {
        src: ['test/mocha/api/**.js']
      }
    }
  });

  //Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-s3');
  grunt.loadNpmTasks('grunt-mocha-test');


  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  //Default task(s).
  grunt.registerTask('default', ['sass']);
  grunt.registerTask('test:api', ['mochaTest:api']);
  grunt.registerTask('build:production', ['sass:production','ngtemplates:directives','ngtemplates:views','concat','ngmin','uglify','s3:production']);
  grunt.registerTask('build:test', ['sass:test','ngtemplates:directives','ngtemplates:views','concat','ngmin','uglify','s3:test']);
  grunt.registerTask('build:staging', ['sass:production','ngtemplates:directives','ngtemplates:views','concat','ngmin','uglify','s3:staging']);
  grunt.registerTask('heroku:production', ['build:production']);
  grunt.registerTask('heroku:test',  ['build:test']);
  grunt.registerTask('heroku:staging', ['build:staging']);

};