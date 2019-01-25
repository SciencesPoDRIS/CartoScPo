'use strict';

var config = require('config');

var gulp = require('gulp'),
  less = require('gulp-less'),
  concat = require('gulp-concat'),
  replace = require('gulp-replace'),
  uglifyes = require('uglify-es'),
  uglify = require('gulp-uglify/composer')(uglifyes),
  ngAnnotate = require('gulp-ng-annotate'),
  browserSync = require('browser-sync').create(),
  cleanCSS = require('gulp-clean-css'),
  fs = require('fs');

gulp.srcStrict = function(files) {
  files.forEach(function(file) {
    if (file.indexOf('*') === -1) {
      // Exclude globs
      fs.accessSync(file);
    }
  });
  return gulp.src(files);
};

// Concat and minify all JS libraries
gulp.task('js:lib', function() {
  return gulp
    .srcStrict([
      'bower_components/lodash/dist/lodash.min.js',
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/jquery-highlight/jquery.highlight.js',
      'bower_components/jquery-ui/jquery-ui.min.js',
      'bower_components/jquery.scrollTo/jquery.scrollTo.min.js',
      'bower_components/angular/angular.min.js',
      'bower_components/angular-animate/angular-animate.min.js',
      'bower_components/angular-translate/angular-translate.js',
      'bower_components/messageformat/messageformat.js',
      'bower_components/angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.js',
      'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
      'bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
      'bower_components/angular-route/angular-route.min.js',
      'bower_components/angular-sanitize/angular-sanitize.min.js',
      'bower_components/angular-touch/angular-touch.min.js',
      'bower_components/angular-ui-select/dist/select.min.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'bower_components/bootstrap/dist/js/bootstrap.min.js',
      'bower_components/angular-ui-grid/ui-grid.min.js',
      'bower_components/leaflet/dist/leaflet.js',
      'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
      'bower_components/ui-leaflet/dist/ui-leaflet.min.js',
      'bower_components/papaparse/papaparse.min.js',
      'bower_components/lunr.js/lunr.min.js',
      'bower_components/angular-google-analytics/dist/angular-google-analytics.min.js',
      'bower_components/commonmark/dist/commonmark.min.js'
    ])
    .pipe(concat('lib.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./app/assets/js/'));
});

gulp.task('js:app', function() {
  if (typeof config.server.backOfficeBaseUrl === 'undefined') {
    config.server.backOfficeBaseUrl =
      config.server.host + ':' + config.server.port;
  }
  return gulp
    .srcStrict([
      'app/app.js',
      'app/components/center-detail.component.js',
      'app/components/center-list.component.js',
      'app/components/center-map.component.js',
      'app/components/facets.component.js',
      'app/components/logo.component.js',
      'app/components/navbar.component.js',
      'app/controllers/tool.controller.js',
      'app/controllers/project.controller.js',
      'app/filters/filters.js',
      'app/services/location.service.js',
      'app/services/center.service.js',
      'app/services/data.services.js',
      'app/services/facet.service.js',
      'app/services/file.service.js',
      'app/services/map.service.js',
      'app/services/metadata.service.js',
      'app/services/search.service.js',
      'app/conf/conf.js'
    ])
    .pipe(replace('GOOGLE_ANALYTICS_ID', config.server.googleAnalyticsId))
    .pipe(replace('BACK_OFFICE_BASEURL', config.server.backOfficeBaseUrl))
    .pipe(concat('app.min.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(gulp.dest('./app/assets/js/'));
});

// Convert less file into CSS
gulp.task('less', function() {
  return gulp
    .src('./app/style/style.less')
    .pipe(less())
    .pipe(gulp.dest('./app/style'));
});

// Concat and minify all CSS files
gulp.task('css', ['less'], function() {
  return gulp
    .srcStrict([
      'bower_components/angular-ui-select/dist/select.css',
      'bower_components/leaflet/dist/leaflet.css',
      'bower_components/angular-ui-grid/ui-grid.css',
      'bower_components/font-awesome/css/font-awesome.min.css',
      'app/style/style.css'
    ])
    .pipe(concat('all.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./app/assets/css/'));
});

// Copy one image and the fonts into the assets folder
gulp.task('assets', function() {
  gulp.src('app/img/layers.png').pipe(gulp.dest('./app/assets/css/images/'));
  gulp
    .src('bower_components/font-awesome/fonts/*.*')
    .pipe(gulp.dest('./app/assets/fonts'));
});

// Launch server with browserSync
gulp.task('serve', function() {
  browserSync.init({ server: './app' });
  gulp.watch('app/style/style.less', ['css']);
  gulp.watch('app/style/style.css').on('change', browserSync.reload);
  gulp.watch(['app/*.js', 'app/**/*.js', '!app/assets/**/*.js'], ['js:app']);
  gulp.watch('app/assets/js/lib.min.js').on('change', browserSync.reload);
  gulp.watch('app/assets/js/app.min.js').on('change', browserSync.reload);
  gulp.watch('app/views/*.html').on('change', browserSync.reload);
});

// Default task that launch concat js and css, then copy some assets and launch server
gulp.task('default', ['js:lib', 'js:app', 'css', 'assets', 'serve']);
